"""
Simple Backend Structure Test for OpenReplica
"""
import os
import sys

def test_backend_structure():
    """Test backend has required structure"""
    print("🏗️  Testing Backend Structure...")
    
    required_files = [
        "app/main.py",
        "app/server/routes/microagents.py",
        "app/server/routes/sessions.py", 
        "app/server/routes/websocket_routes.py",
        "app/microagent/microagent.py",
        "app/microagent/types.py",
        "requirements.txt"
    ]
    
    found = []
    missing = []
    
    for file in required_files:
        if os.path.exists(file):
            found.append(file)
        else:
            missing.append(file)
    
    print(f"  ✅ Backend files: {len(found)}/{len(required_files)} found")
    
    if missing:
        print("  ❌ Missing files:")
        for f in missing:
            print(f"    - {f}")
    
    return len(missing) == 0

def test_api_endpoints():
    """Test that API endpoint files have required content"""
    print("\n🔗 Testing API Endpoints...")
    
    # Test microagents endpoints
    microagents_file = "app/server/routes/microagents.py"
    if os.path.exists(microagents_file):
        with open(microagents_file, 'r') as f:
            content = f.read()
        
        required_endpoints = [
            "def list_microagents",
            "def get_microagent", 
            "def create_microagent",
            "def update_microagent",
            "def delete_microagent",
            "def test_microagent_triggers",
            "def get_builtin_templates",
            "def import_microagent_from_file",
            "def export_microagent"
        ]
        
        found_endpoints = sum(1 for endpoint in required_endpoints if endpoint in content)
        print(f"  ✅ Microagents endpoints: {found_endpoints}/{len(required_endpoints)}")
    else:
        print("  ❌ Microagents file not found")
        found_endpoints = 0
    
    # Test sessions endpoints
    sessions_file = "app/server/routes/sessions.py"
    if os.path.exists(sessions_file):
        with open(sessions_file, 'r') as f:
            content = f.read()
        
        required_endpoints = [
            "def create_session",
            "def get_session",
            "def list_sessions", 
            "def delete_session",
            "def get_session_messages",
            "def add_session_message",
            "def get_session_events",
            "def add_session_event"
        ]
        
        found_sessions = sum(1 for endpoint in required_endpoints if endpoint in content)
        print(f"  ✅ Sessions endpoints: {found_sessions}/{len(required_endpoints)}")
    else:
        print("  ❌ Sessions file not found")
        found_sessions = 0
    
    return found_endpoints >= 7 and found_sessions >= 6

def test_microagents_system():
    """Test microagents system implementation"""
    print("\n🤖 Testing Microagents System...")
    
    # Check microagent types
    types_file = "app/microagent/types.py"
    if os.path.exists(types_file):
        with open(types_file, 'r') as f:
            content = f.read()
        
        has_microagent_type = "MicroagentType" in content
        has_knowledge_type = "KNOWLEDGE" in content
        has_repo_type = "REPO" in content or "REPO_KNOWLEDGE" in content
        
        print(f"  ✅ MicroagentType enum: {'Yes' if has_microagent_type else 'No'}")
        print(f"  ✅ Knowledge type: {'Yes' if has_knowledge_type else 'No'}")
        print(f"  ✅ Repository type: {'Yes' if has_repo_type else 'No'}")
        
        types_score = sum([has_microagent_type, has_knowledge_type, has_repo_type])
    else:
        print("  ❌ Types file not found")
        types_score = 0
    
    # Check microagent implementation
    microagent_file = "app/microagent/microagent.py"
    if os.path.exists(microagent_file):
        with open(microagent_file, 'r') as f:
            content = f.read()
        
        has_base_microagent = "class BaseMicroagent" in content
        has_load_method = "def load" in content
        
        print(f"  ✅ BaseMicroagent class: {'Yes' if has_base_microagent else 'No'}")
        print(f"  ✅ Load method: {'Yes' if has_load_method else 'No'}")
        
        impl_score = sum([has_base_microagent, has_load_method])
    else:
        print("  ❌ Microagent file not found")
        impl_score = 0
    
    return types_score >= 2 and impl_score >= 1

def main():
    """Run backend tests"""
    print("🔍 OpenReplica Backend Structure Test")
    print("=" * 50)
    
    tests = [
        ("Backend Structure", test_backend_structure),
        ("API Endpoints", test_api_endpoints), 
        ("Microagents System", test_microagents_system)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"  ❌ Error in {test_name}: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("📊 BACKEND TEST SUMMARY") 
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status:<8} {test_name}")
    
    print("-" * 50)
    print(f"OVERALL: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    return passed == total

if __name__ == "__main__":
    main()
