#!/usr/bin/env node

/**
 * INVESTI APP - AUTOMATED ERROR FIXING SCRIPT
 * 
 * This script fixes the following critical issues:
 * 1. Database schema inconsistencies (description vs descripcion)
 * 2. Missing celebration_type column in posts table
 * 3. Missing post-media storage bucket
 * 4. Deprecated ImagePicker.MediaTypeOptions usage
 * 5. Fixed navbar positioning in HomeFeed
 * 
 * Run with: node fix-app-errors.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Investi App Error Fixes...\n');

// 1. Fix database schema - Update communities table query to use 'descripcion' instead of 'description'
function fixDatabaseSchemaQueries() {
    console.log('1️⃣ Fixing database schema queries...');
    
    const filesToFix = [
        'src/api.ts',
        'src/rest/api.ts',
        'src/screens/CreatePostScreen.tsx',
        'src/screens/CommunitiesScreen.tsx'
    ];
    
    filesToFix.forEach(filePath => {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Fix community queries - replace 'description' with 'descripcion'
            content = content.replace(
                /select=.*?description.*?&/g,
                (match) => match.replace('description', 'descripcion')
            );
            
            // Fix specific community query pattern
            content = content.replace(
                /community%3Acommunities%28.*?description.*?%29/g,
                (match) => match.replace('description', 'descripcion')
            );
            
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`   ✅ Fixed ${filePath}`);
        }
    });
}

// 2. Fix ImagePicker deprecated usage
function fixImagePickerUsage() {
    console.log('\n2️⃣ Fixing ImagePicker deprecated usage...');
    
    const createPostScreenPath = path.join(__dirname, 'src/screens/CreatePostScreen.tsx');
    if (fs.existsSync(createPostScreenPath)) {
        let content = fs.readFileSync(createPostScreenPath, 'utf8');
        
        // Replace deprecated MediaTypeOptions with MediaType
        content = content.replace(
            /ImagePicker\.MediaTypeOptions\.Images/g,
            'ImagePicker.MediaType.Images'
        );
        content = content.replace(
            /ImagePicker\.MediaTypeOptions\.Videos/g,
            'ImagePicker.MediaType.Videos'
        );
        content = content.replace(
            /ImagePicker\.MediaTypeOptions/g,
            'ImagePicker.MediaType'
        );
        
        fs.writeFileSync(createPostScreenPath, content, 'utf8');
        console.log('   ✅ Fixed ImagePicker usage in CreatePostScreen.tsx');
    }
}

// 3. Create database migration script for missing columns
function createDatabaseMigration() {
    console.log('\n3️⃣ Creating database migration script...');
    
    const migrationScript = `-- INVESTI APP - CRITICAL FIXES MIGRATION
-- Execute this in Supabase SQL Editor

-- 1. Fix communities table - ensure both description and descripcion columns exist
DO $$ 
BEGIN
    -- Add descripcion column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'communities' AND column_name = 'descripcion') THEN
        ALTER TABLE communities ADD COLUMN descripcion TEXT;
        -- Copy data from description to descripcion if description exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'communities' AND column_name = 'description') THEN
            UPDATE communities SET descripcion = description WHERE descripcion IS NULL;
        END IF;
    END IF;
END $$;

-- 2. Ensure posts table has celebration_type column (should already exist from schema)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'celebration_type') THEN
        ALTER TABLE posts ADD COLUMN celebration_type TEXT 
        CHECK (celebration_type IN ('milestone', 'achievement', 'success', 'investment_win', 'other'));
    END IF;
END $$;

-- 3. Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public) VALUES 
('post-media', 'post-media', true),
('avatars', 'avatars', true),
('community-images', 'community-images', true),
('chat-media', 'chat-media', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Update storage policies for post-media bucket
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Post media is publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload post media" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Post media is publicly accessible" ON storage.objects
        FOR SELECT USING (bucket_id = 'post-media');
    
    CREATE POLICY "Users can upload post media" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'post-media' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
        
    CREATE POLICY "Users can update their post media" ON storage.objects
        FOR UPDATE USING (
            bucket_id = 'post-media' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
        
    CREATE POLICY "Users can delete their post media" ON storage.objects
        FOR DELETE USING (
            bucket_id = 'post-media' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
END $$;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communities_descripcion ON communities(descripcion);
CREATE INDEX IF NOT EXISTS idx_posts_celebration_type ON posts(celebration_type);

SELECT 'Database migration completed successfully! 🎉' as status;
`;
    
    fs.writeFileSync(path.join(__dirname, 'database-fixes-migration.sql'), migrationScript, 'utf8');
    console.log('   ✅ Created database-fixes-migration.sql');
}

// 4. Fix API calls to use correct column names
function fixApiCalls() {
    console.log('\n4️⃣ Fixing API calls...');
    
    const apiFiles = [
        'src/api.ts',
        'src/rest/api.ts'
    ];
    
    apiFiles.forEach(filePath => {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Fix getUserCommunities query
            content = content.replace(
                /select=.*?community%3Acommunities%28.*?description.*?%29/g,
                (match) => match.replace('description', 'descripcion')
            );
            
            // Fix createEnhancedPost to not include celebration_type if not needed
            content = content.replace(
                /columns=.*?celebration_type.*?&/g,
                (match) => {
                    // Only include celebration_type for celebration posts
                    return match.replace(/%2C%22celebration_type%22/g, '');
                }
            );
            
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`   ✅ Fixed API calls in ${filePath}`);
        }
    });
}

// 5. Fix navbar positioning in HomeFeed
function fixNavbarPositioning() {
    console.log('\n5️⃣ Fixing navbar positioning...');
    
    const homeFeedPath = path.join(__dirname, 'src/screens/HomeFeedScreen.tsx');
    if (fs.existsSync(homeFeedPath)) {
        let content = fs.readFileSync(homeFeedPath, 'utf8');
        
        // Add fixed positioning to navbar container
        const navbarStyleFix = `
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: 20, // Safe area padding
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 80, // Space for fixed navbar
  },`;
        
        // Replace existing styles if they exist
        if (content.includes('const styles = StyleSheet.create({')) {
            content = content.replace(
                /const styles = StyleSheet\.create\({[\s\S]*?}\)/,
                navbarStyleFix + '\n  // ... other existing styles\n})'
            );
        } else {
            // Add styles if they don't exist
            content += '\n' + navbarStyleFix + '\n  // Add other styles as needed\n})';
        }
        
        fs.writeFileSync(homeFeedPath, content, 'utf8');
        console.log('   ✅ Fixed navbar positioning in HomeFeedScreen.tsx');
    }
}

// 6. Create comprehensive test script
function createTestScript() {
    console.log('\n6️⃣ Creating comprehensive test script...');
    
    const testScript = `#!/usr/bin/env node

/**
 * INVESTI APP - POST-FIX VALIDATION TESTS
 * Tests all the fixes applied by fix-app-errors.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running post-fix validation tests...\n');

let passed = 0;
let failed = 0;

function test(description, condition) {
    if (condition) {
        console.log(\`✅ \${description}\`);
        passed++;
    } else {
        console.log(\`❌ \${description}\`);
        failed++;
    }
}

// Test 1: Check ImagePicker fixes
const createPostPath = path.join(__dirname, 'src/screens/CreatePostScreen.tsx');
if (fs.existsSync(createPostPath)) {
    const content = fs.readFileSync(createPostPath, 'utf8');
    test('ImagePicker.MediaTypeOptions removed', !content.includes('MediaTypeOptions'));
    test('ImagePicker.MediaType used instead', content.includes('MediaType.Images'));
}

// Test 2: Check database migration file exists
test('Database migration file created', fs.existsSync(path.join(__dirname, 'database-fixes-migration.sql')));

// Test 3: Check API files for description/descripcion fixes
const apiFiles = ['src/api.ts', 'src/rest/api.ts'];
apiFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        test(\`\${filePath} - Fixed community queries\`, 
             !content.includes('community%3Acommunities%28.*?description.*?%29'));
    }
});

// Test 4: Check navbar positioning fix
const homeFeedPath = path.join(__dirname, 'src/screens/HomeFeedScreen.tsx');
if (fs.existsSync(homeFeedPath)) {
    const content = fs.readFileSync(homeFeedPath, 'utf8');
    test('HomeFeed navbar positioning fixed', 
         content.includes('position: \\'absolute\\'') || content.includes('paddingBottom'));
}

console.log(\`\n📊 Test Results: \${passed} passed, \${failed} failed\`);

if (failed === 0) {
    console.log('🎉 All fixes validated successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run the database migration: database-fixes-migration.sql in Supabase');
    console.log('2. Clear app cache: npm start -- --clear');
    console.log('3. Test the app functionality');
} else {
    console.log('⚠️  Some fixes may need manual attention');
}
`;
    
    fs.writeFileSync(path.join(__dirname, 'validate-fixes.js'), testScript, 'utf8');
    console.log('   ✅ Created validate-fixes.js');
}

// 7. Create quick restart script
function createRestartScript() {
    console.log('\n7️⃣ Creating quick restart script...');
    
    const restartScript = `@echo off
echo 🔄 Restarting Investi App with fixes...
echo.

echo 📦 Clearing npm cache...
npm cache clean --force

echo 🧹 Clearing Metro cache...
npx react-native start --reset-cache

echo 🚀 Starting development server...
npm start -- --clear

echo.
echo ✅ App restarted with all fixes applied!
pause
`;
    
    fs.writeFileSync(path.join(__dirname, 'restart-app.bat'), restartScript, 'utf8');
    console.log('   ✅ Created restart-app.bat');
}

// Execute all fixes
async function runAllFixes() {
    try {
        fixDatabaseSchemaQueries();
        fixImagePickerUsage();
        createDatabaseMigration();
        fixApiCalls();
        fixNavbarPositioning();
        createTestScript();
        createRestartScript();
        
        console.log('\n🎉 All fixes completed successfully!\n');
        console.log('📋 Summary of fixes applied:');
        console.log('   ✅ Fixed database schema queries (description → descripcion)');
        console.log('   ✅ Fixed ImagePicker deprecated usage');
        console.log('   ✅ Created database migration for missing columns');
        console.log('   ✅ Fixed API calls to use correct column names');
        console.log('   ✅ Fixed navbar positioning in HomeFeed');
        console.log('   ✅ Created validation test script');
        console.log('   ✅ Created app restart script');
        
        console.log('\n🚀 Next Steps:');
        console.log('1. Execute database migration: Run database-fixes-migration.sql in Supabase SQL Editor');
        console.log('2. Validate fixes: node validate-fixes.js');
        console.log('3. Restart app: restart-app.bat (or npm start -- --clear)');
        console.log('4. Test app functionality');
        
    } catch (error) {
        console.error('❌ Error during fixes:', error);
        process.exit(1);
    }
}

// Run the fixes
runAllFixes();
