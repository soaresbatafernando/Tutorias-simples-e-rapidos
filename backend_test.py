import requests
import sys
import json
from datetime import datetime
import base64

class TutoriaFacilAPITester:
    def __init__(self, base_url="https://tutoria-facil.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_auth = ('admin', 'admin123')
        self.session = requests.Session()

    def run_test(self, name, method, endpoint, expected_status, data=None, auth=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers, auth=auth, params=params)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers, auth=auth)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers, auth=auth)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers, auth=auth)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_stats_endpoint(self):
        """Test stats endpoint"""
        return self.run_test("Stats", "GET", "stats", 200)

    def test_categories_crud(self):
        """Test categories CRUD operations"""
        print("\n📁 Testing Categories CRUD...")
        
        # Get categories
        success, categories = self.run_test("Get Categories", "GET", "categories", 200)
        if not success:
            return False
            
        # Create category (admin required)
        category_data = {
            "name": "Test Category",
            "slug": "test-category",
            "icon": "test",
            "description": "Test category description"
        }
        success, created_cat = self.run_test(
            "Create Category", "POST", "admin/categories", 
            200, category_data, self.admin_auth
        )
        
        if success and created_cat:
            # Delete the created category
            cat_id = created_cat.get('id')
            if cat_id:
                self.run_test(
                    "Delete Category", "DELETE", f"admin/categories/{cat_id}", 
                    200, auth=self.admin_auth
                )
        
        return success

    def test_tutorials_crud(self):
        """Test tutorials CRUD operations"""
        print("\n📚 Testing Tutorials CRUD...")
        
        # Get tutorials
        success, tutorials = self.run_test("Get Tutorials", "GET", "tutorials", 200)
        if not success:
            return False
            
        # Get tutorials with filters
        self.run_test("Get Featured Tutorials", "GET", "tutorials", 200, params={"featured": "true"})
        self.run_test("Get Tutorials with Search", "GET", "tutorials", 200, params={"search": "windows"})
        
        # Get categories first for tutorial creation
        success, categories = self.run_test("Get Categories for Tutorial", "GET", "categories", 200)
        if not success or not categories:
            print("❌ No categories available for tutorial creation")
            return False
            
        # Create tutorial (admin required)
        tutorial_data = {
            "title": "Test Tutorial",
            "slug": "test-tutorial",
            "description": "Test tutorial description",
            "content": "# Test Tutorial\n\nThis is a test tutorial content.",
            "category_id": categories[0]['id'],
            "tags": ["test", "tutorial"],
            "image_url": "https://example.com/image.jpg",
            "is_featured": False
        }
        success, created_tutorial = self.run_test(
            "Create Tutorial", "POST", "admin/tutorials", 
            200, tutorial_data, self.admin_auth
        )
        
        if success and created_tutorial:
            tutorial_id = created_tutorial.get('id')
            tutorial_slug = created_tutorial.get('slug')
            
            if tutorial_slug:
                # Get tutorial by slug
                self.run_test("Get Tutorial by Slug", "GET", f"tutorials/{tutorial_slug}", 200)
                
                # Rate tutorial
                rating_data = {"tutorial_id": tutorial_slug, "rating": 5}
                self.run_test("Rate Tutorial", "POST", f"tutorials/{tutorial_slug}/rate", 200, rating_data)
            
            if tutorial_id:
                # Update tutorial
                update_data = {"title": "Updated Test Tutorial"}
                self.run_test(
                    "Update Tutorial", "PUT", f"admin/tutorials/{tutorial_id}", 
                    200, update_data, self.admin_auth
                )
                
                # Delete tutorial
                self.run_test(
                    "Delete Tutorial", "DELETE", f"admin/tutorials/{tutorial_id}", 
                    200, auth=self.admin_auth
                )
        
        return success

    def test_comments_crud(self):
        """Test comments CRUD operations"""
        print("\n💬 Testing Comments CRUD...")
        
        # Get tutorials first
        success, tutorials = self.run_test("Get Tutorials for Comments", "GET", "tutorials", 200)
        if not success or not tutorials:
            print("❌ No tutorials available for comment testing")
            return False
            
        tutorial_id = tutorials[0]['id']
        
        # Get comments for tutorial
        self.run_test("Get Comments", "GET", f"tutorials/{tutorial_id}/comments", 200)
        
        # Create comment
        comment_data = {
            "tutorial_id": tutorial_id,
            "name": "Test User",
            "email": "test@example.com",
            "content": "This is a test comment"
        }
        success, created_comment = self.run_test("Create Comment", "POST", "comments", 200, comment_data)
        
        if success and created_comment:
            comment_id = created_comment.get('id')
            if comment_id:
                # Delete comment (admin required)
                self.run_test(
                    "Delete Comment", "DELETE", f"admin/comments/{comment_id}", 
                    200, auth=self.admin_auth
                )
        
        return success

    def test_faqs_crud(self):
        """Test FAQs CRUD operations"""
        print("\n❓ Testing FAQs CRUD...")
        
        # Get FAQs
        success, faqs = self.run_test("Get FAQs", "GET", "faqs", 200)
        if not success:
            return False
            
        # Get FAQs by category
        self.run_test("Get FAQs by Category", "GET", "faqs", 200, params={"category": "geral"})
        
        # Create FAQ (admin required)
        faq_data = {
            "question": "Test question?",
            "answer": "Test answer",
            "category": "geral",
            "order": 0
        }
        success, created_faq = self.run_test(
            "Create FAQ", "POST", "admin/faqs", 
            200, faq_data, self.admin_auth
        )
        
        if success and created_faq:
            faq_id = created_faq.get('id')
            if faq_id:
                # Delete FAQ
                self.run_test(
                    "Delete FAQ", "DELETE", f"admin/faqs/{faq_id}", 
                    200, auth=self.admin_auth
                )
        
        return success

    def test_blog_crud(self):
        """Test blog CRUD operations"""
        print("\n📝 Testing Blog CRUD...")
        
        # Get blog posts
        success, posts = self.run_test("Get Blog Posts", "GET", "blog", 200)
        if not success:
            return False
            
        # Create blog post (admin required)
        blog_data = {
            "title": "Test Blog Post",
            "slug": "test-blog-post",
            "excerpt": "Test excerpt",
            "content": "# Test Blog Post\n\nThis is test content.",
            "image_url": "https://example.com/blog.jpg",
            "tags": ["test", "blog"]
        }
        success, created_post = self.run_test(
            "Create Blog Post", "POST", "admin/blog", 
            200, blog_data, self.admin_auth
        )
        
        if success and created_post:
            post_slug = created_post.get('slug')
            post_id = created_post.get('id')
            
            if post_slug:
                # Get blog post by slug
                self.run_test("Get Blog Post by Slug", "GET", f"blog/{post_slug}", 200)
            
            if post_id:
                # Delete blog post
                self.run_test(
                    "Delete Blog Post", "DELETE", f"admin/blog/{post_id}", 
                    200, auth=self.admin_auth
                )
        
        return success

    def test_contact_crud(self):
        """Test contact CRUD operations"""
        print("\n📧 Testing Contact CRUD...")
        
        # Create contact message
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message"
        }
        success, created_contact = self.run_test("Create Contact", "POST", "contact", 200, contact_data)
        
        # Get contacts (admin required)
        self.run_test("Get Contacts", "GET", "admin/contacts", 200, auth=self.admin_auth)
        
        return success

    def test_ai_chat(self):
        """Test AI chat functionality"""
        print("\n🤖 Testing AI Chat...")
        
        chat_data = {
            "message": "Olá, como posso formatar meu computador?",
            "session_id": None
        }
        success, response = self.run_test("AI Chat", "POST", "chat", 200, chat_data)
        
        if success and response:
            print(f"   AI Response: {response.get('response', '')[:100]}...")
            session_id = response.get('session_id')
            if session_id:
                # Test follow-up message
                follow_up_data = {
                    "message": "Obrigado pela ajuda!",
                    "session_id": session_id
                }
                self.run_test("AI Chat Follow-up", "POST", "chat", 200, follow_up_data)
        
        return success

    def test_admin_auth(self):
        """Test admin authentication"""
        print("\n🔐 Testing Admin Authentication...")
        
        # Test with correct credentials
        success, _ = self.run_test("Admin Auth Valid", "GET", "admin/contacts", 200, auth=self.admin_auth)
        
        # Test with wrong credentials
        wrong_auth = ('admin', 'wrongpassword')
        self.run_test("Admin Auth Invalid", "GET", "admin/contacts", 401, auth=wrong_auth)
        
        return success

    def test_seed_data(self):
        """Test seed data creation"""
        print("\n🌱 Testing Seed Data...")
        
        return self.run_test("Seed Data", "POST", "admin/seed", 200, {}, self.admin_auth)

def main():
    print("🚀 Starting Tutoria Fácil API Tests...")
    print("=" * 50)
    
    tester = TutoriaFacilAPITester()
    
    # Run all tests
    test_results = []
    
    # Basic endpoints
    test_results.append(tester.test_root_endpoint())
    test_results.append(tester.test_stats_endpoint())
    
    # Authentication
    test_results.append(tester.test_admin_auth())
    
    # CRUD operations
    test_results.append(tester.test_categories_crud())
    test_results.append(tester.test_tutorials_crud())
    test_results.append(tester.test_comments_crud())
    test_results.append(tester.test_faqs_crud())
    test_results.append(tester.test_blog_crud())
    test_results.append(tester.test_contact_crud())
    
    # AI functionality
    test_results.append(tester.test_ai_chat())
    
    # Seed data
    test_results.append(tester.test_seed_data())
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend API is working well!")
        return 0
    elif success_rate >= 60:
        print("⚠️  Backend API has some issues but is mostly functional")
        return 1
    else:
        print("❌ Backend API has significant issues")
        return 2

if __name__ == "__main__":
    sys.exit(main())