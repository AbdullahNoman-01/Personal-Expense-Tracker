import re
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


FEMALE_NAME_TOKENS = {
    # Bengali / Muslim female titles, suffixes, and honorifics
    'akter', 'aktar', 'begum', 'khatun', 'nesa', 'necha', 'bibi', 'banu', 'sultana', 'umme', 'syeda',
    # Bengali / South Asian female first and middle names
    'fatema', 'fatima', 'sadia', 'nusrat', 'jahan', 'mim', 'tanjina', 'tanjila', 'suraiya', 'sumaiya',
    'afrin', 'tasnim', 'samia', 'sabrina', 'sharmin', 'shirin', 'monira', 'marufa', 'tamanna', 'farzana',
    'fariha', 'afroza', 'roksana', 'salma', 'amina', 'ayesha', 'khadija', 'mariam', 'maryam', 'asma',
    'tahmina', 'rabeya', 'rebeka', 'ruma', 'rupa', 'nigar', 'shampa', 'munira', 'shaila', 'shanta',
    'swapna', 'sonia', 'meher', 'parveen', 'parvin', 'yasmin', 'nasrin', 'nasreen', 'shamima', 'hasina',
    'khaleda', 'fahmida', 'sanjida', 'tabassum', 'anika', 'nowshin', 'lubna', 'bushra', 'tasnuva', 'jannat',
    'jannatul', 'ferdaus', 'razia', 'morium', 'mahmuda', 'arifa', 'nahid', 'sima', 'shima', 'mita',
    'rita', 'gita', 'priya', 'puja', 'ananya', 'aditi', 'diya', 'sneha', 'trisha', 'monisha', 'payel',
    'rina', 'dina', 'mina', 'mou', 'mitu', 'eti', 'poly', 'shila', 'ratna', 'runa', 'dalia', 'bithi',
    'sonali', 'shikha', 'mousumi', 'popi', 'popy', 'shabnur', 'purnima', 'aparajita', 'farah', 'sabah',
    'nadia', 'rima', 'lima', 'tania', 'munni', 'nodi', 'tithi', 'anupama', 'anita', 'koli', 'bristy',
    # International female names
    'emma', 'olivia', 'sophia', 'ava', 'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn',
    'abigail', 'emily', 'elizabeth', 'mila', 'ella', 'avery', 'sofia', 'camila', 'aria', 'scarlett',
    'victoria', 'madison', 'luna', 'grace', 'chloe', 'penelope', 'layla', 'riley', 'zoey', 'nora',
    'lily', 'eleanor', 'hannah', 'lillian', 'addison', 'aubrey', 'ellie', 'stella', 'natalie', 'zoe',
    'leah', 'hazel', 'violet', 'aurora', 'savannah', 'audrey', 'brooklyn', 'bella', 'claire', 'skylar',
    'lucy', 'paisley', 'everly', 'anna', 'caroline', 'nova', 'genesis', 'emilia', 'kennedy', 'samantha',
    'maya', 'sarah', 'sara', 'madelyn', 'adeline', 'allison', 'hailey', 'alice', 'maria', 'mary',
    'jessica', 'ashley', 'amanda', 'jennifer', 'lisa', 'nancy', 'karen', 'betty', 'helen', 'sandra',
    'donna', 'carol', 'ruth', 'sharon', 'michelle', 'laura', 'rebecca', 'kimberly', 'deborah', 'stephanie',
    'cynthia', 'heather', 'amy', 'angela', 'melissa', 'brenda', 'pamela', 'nicole', 'christine', 'catherine',
    'debby', 'debbie', 'janet', 'kelly', 'katie', 'kate', 'julia', 'julie', 'rose', 'daisy', 'jasmine',
    'amber', 'ruby', 'rachel', 'diana', 'vanessa', 'alicia', 'tiffany', 'clara'
}

MALE_NAME_TOKENS = {
    # Bengali / Muslim male titles and honorifics
    'md', 'mohammad', 'mohammed', 'muhammad', 'syed', 'sheikh', 'sk', 'kazi', 'mir', 'choudhury', 'chowdhury',
    # Bengali / South Asian male names
    'noyon', 'noman', 'hasan', 'hassan', 'ali', 'khan', 'ahmed', 'ahmod', 'al-amin', 'alamin',
    'abdullah', 'abdur', 'abdul', 'rahim', 'karim', 'tareq', 'tariq', 'tanvir', 'tanveer', 'sakib',
    'shakib', 'tamim', 'mushfiq', 'mahmud', 'mashrafe', 'mustafiz', 'rubel', 'sohel', 'rana', 'habib',
    'arif', 'monir', 'sayed', 'saeed', 'shafiq', 'rafiq', 'salam', 'barkat', 'jabbar', 'kamal',
    'jamal', 'bilal', 'ibrahim', 'ismail', 'ishaq', 'yaqub', 'yusuf', 'musa', 'harun', 'dawood',
    'sulaiman', 'yunus', 'zakaria', 'yahya', 'isa', 'omar', 'uthman', 'osman', 'bakar', 'zubair',
    'talha', 'hamza', 'khalid', 'zaid', 'anas', 'salman', 'ammar', 'yasir', 'hussain', 'hossein',
    'hossain', 'mahmood', 'farhan', 'faisal', 'fahim', 'nahian', 'sabbir', 'mehedi', 'rakib', 'shanto',
    'anwar', 'jahid', 'zahid', 'saimon', 'riad', 'riaz', 'firoz', 'liton', 'bijoy', 'soumya',
    'taskin', 'shoriful', 'nasum', 'ebadot', 'miraz', 'mehidy', 'joy', 'dipu', 'subrata', 'biplob',
    'shourav', 'sourav', 'rahul', 'amit', 'rohit', 'raj', 'akash', 'bikash', 'sujan', 'sumon',
    'babu', 'milon', 'mamun', 'mithun', 'ashik', 'ashique', 'sagor', 'sagur', 'shuvo', 'shubho',
    'shawon', 'shadhin', 'polash', 'palash', 'shimul', 'kamrul', 'khairul', 'badhon', 'saiful', 'nazmul',
    'masud', 'towhid', 'tauhid', 'touhid', 'mostafa', 'mustafa', 'golam', 'imran', 'ridwan', 'redwan',
    'rafsan', 'mahfuz', 'momin', 'ashraful', 'afif', 'saif', 'maruf', 'asif', 'raihan', 'rayhan',
    'shahid', 'shahin', 'sharif', 'sazzad', 'sajid', 'mizan', 'delwar', 'enamul', 'mokbul', 'sohag',
    # International male names
    'john', 'david', 'michael', 'james', 'robert', 'william', 'richard', 'thomas', 'charles', 'christopher',
    'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven', 'paul', 'andrew', 'joshua', 'kenneth',
    'kevin', 'brian', 'george', 'timothy', 'ronald', 'edward', 'jason', 'jeffrey', 'ryan', 'jacob',
    'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry', 'justin', 'scott', 'brandon', 'benjamin',
    'samuel', 'gregory', 'alexander', 'frank', 'patrick', 'raymond', 'jack', 'dennis', 'jerry', 'tyler',
    'aaron', 'jose', 'adam', 'nathan', 'henry', 'douglas', 'zachary', 'peter', 'kyle', 'walter',
    'ethan', 'jeremy', 'harold', 'keith', 'christian', 'roger', 'noah', 'gerald', 'carl', 'terry',
    'sean', 'austin', 'arthur', 'lawrence', 'jesse', 'dylan', 'bryan', 'joe', 'jordan', 'billy',
    'bruce', 'albert', 'willie', 'gabriel', 'logan', 'alan', 'juan', 'wayne', 'roy', 'ralph',
    'randy', 'eugene', 'vincent', 'russell', 'louis', 'philip', 'bobby', 'johnny', 'bradley', 'lucas',
    'oliver', 'mason', 'liam', 'felix', 'alex'
}


def detect_gender_from_user(user):
    """
    Detects gender based on user's first name, last name, and username.
    Returns 'female', 'male', or None (if indistinguishable).
    """
    if not user:
        return None

    full_name = f"{user.first_name} {user.last_name}".strip()
    candidates = []
    if full_name:
        candidates.append(full_name)
    if user.username:
        candidates.append(user.username)

    tokens = []
    for cand in candidates:
        cleaned = re.sub(r'[^a-zA-Z\s]', ' ', cand.lower())
        tokens.extend(cleaned.split())

    # Exact token match
    for token in tokens:
        if token in FEMALE_NAME_TOKENS:
            return 'female'
        if token in MALE_NAME_TOKENS:
            return 'male'

    # Substring search for username tokens (e.g. 'sadia123', 'noyonhasan10001')
    uname = user.username.lower() if user.username else ''
    for fname in FEMALE_NAME_TOKENS:
        if len(fname) >= 4 and fname in uname:
            return 'female'
    for mname in MALE_NAME_TOKENS:
        if len(mname) >= 4 and mname in uname:
            return 'male'

    return None


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.FileField(upload_to='avatars/', blank=True, null=True)
    avatar_data = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True, max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def avatar_url(self):
        # 1. Custom uploaded photo (Base64 data URI)
        if self.avatar_data:
            return self.avatar_data

        # 2. Uploaded file fallback (if file storage is enabled)
        if self.avatar:
            try:
                return self.avatar.url
            except Exception:
                pass

        # 3. Gender-based default avatar
        gender = detect_gender_from_user(self.user)
        if gender == 'female':
            return '/static/avatar-female.svg'
        elif gender == 'male':
            return '/static/avatar-male.svg'

        # 4. Unknown / Indistinguishable gender -> Blank silhouette placeholder
        return '/static/avatar-neutral.svg'


@receiver(post_save, sender=User)
def create_or_save_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        if hasattr(instance, 'profile'):
            try:
                instance.profile.save()
            except Exception:
                pass
        else:
            Profile.objects.create(user=instance)
