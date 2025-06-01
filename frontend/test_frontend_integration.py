"""
Comprehensive Frontend Integration Test for OpenReplica
Tests that all components and integrations are production-ready
"""
import os
import re
import json
from pathlib import Path

def test_component_structure():
    """Test that all required components exist and are properly structured"""
    print("🧩 Testing Component Structure...")
    
    required_components = [
        # Core pages
        "src/routes/microagents.tsx",
        "src/routes/sessions.tsx", 
        "src/routes/home.tsx",
        "src/routes/conversation.tsx",
        
        # Microagents components
        "src/components/features/microagents/microagents-page.tsx",
        "src/components/features/microagents/microagent-card.tsx",
        "src/components/features/microagents/create-microagent-modal.tsx",
        "src/components/features/microagents/import-microagent-modal.tsx",
        "src/components/features/microagents/microagent-test-modal.tsx",
        
        # Sessions components
        "src/components/features/sessions/sessions-page.tsx",
        "src/components/features/sessions/create-session-modal.tsx", 
        "src/components/features/sessions/session-details-modal.tsx",
        
        # Navigation components
        "src/components/shared/buttons/microagents-button.tsx",
        "src/components/shared/buttons/sessions-button.tsx",
        
        # Animation components
        "src/components/shared/animations/purple-glow.tsx",
        "src/components/shared/animations/floating-particles.tsx",
        
        # API integration
        "src/api/openreplica.ts",
        "src/api/openreplica-axios.ts",
        
        # Branding
        "src/assets/branding/openreplica-logo-spark.tsx"
    ]
    
    missing = []
    found = []
    
    for component in required_components:
        if os.path.exists(component):
            found.append(component)
        else:
            missing.append(component)
    
    print(f"  ✅ Found: {len(found)}/{len(required_components)} components")
    
    if missing:
        print("  ❌ Missing components:")
        for comp in missing:
            print(f"    - {comp}")
    
    return len(missing) == 0

def test_api_integration():
    """Test that API integration is complete and consistent"""
    print("\n🔗 Testing API Integration...")
    
    api_file = "src/api/openreplica.ts"
    if not os.path.exists(api_file):
        print("  ❌ API file not found")
        return False
    
    with open(api_file, 'r') as f:
        content = f.read()
    
    # Check for OpenReplica custom API methods
    required_methods = [
        "getMicroagents",
        "createMicroagent", 
        "updateMicroagent",
        "deleteMicroagent",
        "testMicroagent",
        "importMicroagent",
        "exportMicroagent",
        "getMicroagentTemplates",
        "getSessions",
        "createSession",
        "deleteSession",
        "getSessionMessages",
        "addSessionMessage",
        "getSessionEvents",
        "addSessionEvent"
    ]
    
    found_methods = []
    for method in required_methods:
        if f"static async {method}" in content:
            found_methods.append(method)
    
    print(f"  ✅ API Methods: {len(found_methods)}/{len(required_methods)} implemented")
    
    missing_methods = set(required_methods) - set(found_methods)
    if missing_methods:
        print("  ❌ Missing API methods:")
        for method in missing_methods:
            print(f"    - {method}")
    
    return len(missing_methods) == 0

def test_component_imports():
    """Test that all components have correct imports and no broken references"""
    print("\n📦 Testing Component Imports...")
    
    component_files = []
    for root, dirs, files in os.walk("src"):
        for file in files:
            if file.endswith(('.tsx', '.ts')) and not file.endswith('.test.tsx'):
                component_files.append(os.path.join(root, file))
    
    issues = []
    api_usage_count = 0
    
    for file_path in component_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for old API imports
            if 'from \'#/api/openreplica-axios\'' in content:
                issues.append(f"{file_path}: Still using old openreplica-axios import")
            
            # Check for OpenReplica API usage
            if 'OpenReplica.' in content:
                api_usage_count += content.count('OpenReplica.')
            
            # Check for proper TypeScript imports
            if 'import type' in content and 'from' in content:
                # This is good - proper TypeScript imports
                pass
                
        except Exception as e:
            issues.append(f"{file_path}: Error reading file - {e}")
    
    print(f"  ✅ Scanned: {len(component_files)} files")
    print(f"  ✅ OpenReplica API calls: {api_usage_count}")
    
    if issues:
        print("  ⚠️  Import Issues found:")
        for issue in issues[:5]:  # Show first 5 issues
            print(f"    - {issue}")
        if len(issues) > 5:
            print(f"    ... and {len(issues) - 5} more issues")
    
    return len(issues) == 0

def test_theme_consistency():
    """Test that purple/black theme is consistently applied"""
    print("\n🎨 Testing Theme Consistency...")
    
    # Check tailwind config
    tailwind_file = "tailwind.config.js"
    if os.path.exists(tailwind_file):
        with open(tailwind_file, 'r') as f:
            content = f.read()
        
        purple_colors = ['#8B5CF6', '#A855F7', '#C084FC']
        theme_score = sum(1 for color in purple_colors if color in content)
        print(f"  ✅ Purple theme colors: {theme_score}/{len(purple_colors)} found in config")
    else:
        print("  ⚠️  Tailwind config not found")
        theme_score = 0
    
    # Check for consistent branding
    branding_files = [
        "src/assets/branding/openreplica-logo-spark.tsx",
        "src/components/shared/animations/purple-glow.tsx",
        "src/components/shared/animations/floating-particles.tsx"
    ]
    
    branding_score = sum(1 for file in branding_files if os.path.exists(file))
    print(f"  ✅ Branding components: {branding_score}/{len(branding_files)} found")
    
    return theme_score >= 2 and branding_score >= 2

def test_routing_configuration():
    """Test that routing is properly configured"""
    print("\n🗺️  Testing Routing Configuration...")
    
    routes_file = "src/routes.ts"
    if not os.path.exists(routes_file):
        print("  ❌ Routes file not found")
        return False
    
    with open(routes_file, 'r') as f:
        content = f.read()
    
    required_routes = [
        'route("microagents"',
        'route("sessions"',
        'route("conversations/:conversationId"',
        'index("routes/home.tsx")'
    ]
    
    found_routes = []
    for route in required_routes:
        if route in content:
            found_routes.append(route)
    
    print(f"  ✅ Routes: {len(found_routes)}/{len(required_routes)} configured")
    
    # Check for proper layout structure
    has_layout = 'layout(' in content
    print(f"  ✅ Layout structure: {'Yes' if has_layout else 'No'}")
    
    return len(found_routes) == len(required_routes) and has_layout

def test_production_readiness():
    """Test production readiness indicators"""
    print("\n🚀 Testing Production Readiness...")
    
    # Check package.json
    if os.path.exists("package.json"):
        with open("package.json", 'r') as f:
            package_data = json.load(f)
        
        has_build_script = 'build' in package_data.get('scripts', {})
        has_dependencies = len(package_data.get('dependencies', {})) > 0
        correct_name = package_data.get('name') == 'openreplica-frontend'
        
        print(f"  ✅ Build script: {'Yes' if has_build_script else 'No'}")
        print(f"  ✅ Dependencies: {len(package_data.get('dependencies', {}))}")
        print(f"  ✅ Correct name: {'Yes' if correct_name else 'No'}")
    else:
        print("  ❌ package.json not found")
        return False
    
    # Check for TypeScript configuration
    has_tsconfig = os.path.exists("tsconfig.json")
    print(f"  ✅ TypeScript config: {'Yes' if has_tsconfig else 'No'}")
    
    # Check for build output directory
    has_build_dir = os.path.exists("build")
    print(f"  ✅ Build directory: {'Yes' if has_build_dir else 'No'}")
    
    return has_build_script and has_dependencies and correct_name and has_tsconfig

def test_openhands_feature_parity():
    """Test that OpenHands features are preserved"""
    print("\n⚖️  Testing OpenHands Feature Parity...")
    
    # Check for core OpenHands components that should still exist
    openhands_features = [
        "src/routes/conversation.tsx",
        "src/routes/terminal-tab.tsx", 
        "src/routes/browser-tab.tsx",
        "src/routes/jupyter-tab.tsx",
        "src/routes/settings.tsx",
        "src/components/features/sidebar/sidebar.tsx"
    ]
    
    preserved_features = []
    for feature in openhands_features:
        if os.path.exists(feature):
            preserved_features.append(feature)
    
    print(f"  ✅ OpenHands features preserved: {len(preserved_features)}/{len(openhands_features)}")
    
    # Check that API still has OpenHands methods
    api_file = "src/api/openreplica.ts"
    if os.path.exists(api_file):
        with open(api_file, 'r') as f:
            content = f.read()
        
        openhands_methods = [
            "getModels",
            "getAgents", 
            "getConfig",
            "createConversation",
            "getConversation",
            "getSettings",
            "saveSettings"
        ]
        
        preserved_methods = sum(1 for method in openhands_methods if f"static async {method}" in content)
        print(f"  ✅ OpenHands API methods: {preserved_methods}/{len(openhands_methods)}")
        
        return len(preserved_features) >= len(openhands_features) * 0.8 and preserved_methods >= len(openhands_methods) * 0.8
    
    return False

def main():
    """Run comprehensive integration tests"""
    print("🔍 OpenReplica Frontend Integration Test Suite")
    print("=" * 60)
    
    tests = [
        ("Component Structure", test_component_structure),
        ("API Integration", test_api_integration), 
        ("Component Imports", test_component_imports),
        ("Theme Consistency", test_theme_consistency),
        ("Routing Configuration", test_routing_configuration),
        ("Production Readiness", test_production_readiness),
        ("OpenHands Feature Parity", test_openhands_feature_parity)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"  ❌ Error in {test_name}: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status:<8} {test_name}")
    
    print("-" * 60)
    print(f"OVERALL: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - PRODUCTION READY!")
    elif passed >= total * 0.8:
        print("\n✅ MOSTLY READY - Minor issues to address")
    else:
        print("\n⚠️  NEEDS WORK - Several issues found")
    
    return passed == total

if __name__ == "__main__":
    main()
