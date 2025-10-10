-- =====================================================
-- CHECK USER COMMUNITY MEMBERSHIPS AND UPDATE TO ADMIN
-- User ID: c7812eb1-c3b1-429f-aabe-ba8da052201f
-- =====================================================

-- Step 1: Check which communities the user belongs to
SELECT 
    uc.id as membership_id,
    uc.user_id,
    uc.community_id,
    c.nombre as community_name,
    c.name as community_name_en,
    uc.role as current_role,
    uc.status,
    uc.joined_at,
    c.created_by,
    CASE 
        WHEN c.created_by = uc.user_id THEN 'Creator'
        ELSE 'Member'
    END as user_type
FROM user_communities uc
JOIN communities c ON c.id = uc.community_id
WHERE uc.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY uc.joined_at DESC;

-- Step 2: Check current admin status in each community
SELECT 
    uc.community_id,
    c.nombre as community_name,
    uc.role,
    CASE 
        WHEN uc.role = 'admin' THEN 'Already Admin'
        WHEN uc.role = 'owner' THEN 'Already Owner'
        WHEN uc.role = 'moderator' THEN 'Needs Upgrade to Admin'
        WHEN uc.role = 'member' THEN 'Needs Upgrade to Admin'
        ELSE 'Unknown Status'
    END as admin_status
FROM user_communities uc
JOIN communities c ON c.id = uc.community_id
WHERE uc.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- Step 3: Update user to admin in all communities where they are not already owner/admin
UPDATE user_communities
SET role = 'admin'
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
AND role NOT IN ('owner', 'admin')
AND status = 'active';

-- Step 4: Verify the updates
SELECT 
    uc.id as membership_id,
    uc.user_id,
    uc.community_id,
    c.nombre as community_name,
    c.name as community_name_en,
    uc.role as updated_role,
    uc.status,
    uc.joined_at,
    CASE 
        WHEN uc.role IN ('admin', 'owner') THEN '✓ Admin Access'
        ELSE '✗ Not Admin'
    END as admin_verification
FROM user_communities uc
JOIN communities c ON c.id = uc.community_id
WHERE uc.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY uc.joined_at DESC;

-- Step 5: Summary of changes
SELECT 
    COUNT(*) as total_communities,
    COUNT(CASE WHEN role = 'owner' THEN 1 END) as owner_count,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderator_count,
    COUNT(CASE WHEN role = 'member' THEN 1 END) as member_count
FROM user_communities
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
AND status = 'active';
