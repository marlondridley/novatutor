-- Check the profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY 
    ordinal_position;

-- Alternatively, see all columns and a sample row
SELECT * FROM profiles LIMIT 1;

-- Check if required columns exist
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
) as has_subscription_status,
EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'privacy_accepted'
) as has_privacy_accepted,
EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'parent_id'
) as has_parent_id;

