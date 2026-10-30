"""Configuration settings for Indian Sign Language (ISL) Recognition System.
Scalable across the full ISL-CSLRT corpus with dual-hand 128-dimensional representations.
"""
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
STATIC_DATA_DIR = DATA_DIR / "static"
DYNAMIC_DATA_DIR = DATA_DIR / "dynamic"
STATIC_CSV_PATH = STATIC_DATA_DIR / "static_landmarks.csv"
DYNAMIC_NPZ_PATH = DYNAMIC_DATA_DIR / "dynamic_sequences.npz"

MODELS_DIR = BASE_DIR / "models"
STATIC_MODEL_PATH = MODELS_DIR / "static_model.keras"
STATIC_LABELS_PATH = MODELS_DIR / "static_labels.json"
DYNAMIC_MODEL_PATH = MODELS_DIR / "dynamic_model.keras"
DYNAMIC_LABELS_PATH = MODELS_DIR / "dynamic_labels.json"

RESULTS_DIR = BASE_DIR / "results"

# ISL Corpus Directory
CORPUS_ROOT = BASE_DIR / "isldata" / "ISL_CSLRT_Corpus" / "ISL_CSLRT_Corpus"
WORD_FRAMES_DIR = CORPUS_ROOT / "Frames_Word_Level"
SENTENCE_FRAMES_DIR = CORPUS_ROOT / "Frames_Sentence_Level"
SENTENCE_VIDEOS_DIR = CORPUS_ROOT / "Videos_Sentence_Level"
CORPUS_CSV_DIR = CORPUS_ROOT / "corpus_csv_files"

# Dual-Hand MediaPipe Settings
NUM_LANDMARKS_PER_HAND = 21
COORDINATES_PER_LANDMARK = 3  # x, y, z
FEATURES_PER_HAND = NUM_LANDMARKS_PER_HAND * COORDINATES_PER_LANDMARK  # 63
NUM_HANDS = 2
# 63 (Left Hand) + 63 (Right Hand) + 2 (Presence Flags [has_left, has_right]) = 128
NUM_FEATURES = (FEATURES_PER_HAND * NUM_HANDS) + 2  # 128


def get_all_static_classes() -> list[str]:
    """Discover all word categories from Frames_Word_Level."""
    if WORD_FRAMES_DIR.exists():
        dirs = [d.name for d in WORD_FRAMES_DIR.iterdir() if d.is_dir()]
        if dirs:
            return sorted(dirs)
    return [
        "A LOT", "ABUSE", "AFRAID", "AGREE", "ALL", "ANGRY", "ANYTHING", "APPRECIATE",
        "BAD", "BEAUTIFUL", "BECOME", "BED", "BORED", "BRING", "CHAT", "CLASS", "COLD",
        "COLLEGE_SCHOOL", "COMB", "COME", "CONGRATULATIONS", "CRYING", "DARE", "DIFFERENCE",
        "DILEMMA", "DISAPPOINTED", "DO", "DO NOT", "DO NOT AGREE", "ENJOY", "FAVOUR",
        "FEVER", "FINE", "FOOD", "FREE", "FRIEND", "GLASS", "GO", "GOOD", "GRATEFUL",
        "HAIR", "HAPPY", "HE", "HEAR", "HEART", "HELP", "HIDE", "HOW", "HUNGRY", "HURT",
        "I_ME_MINE_MY", "IN", "KNOW", "LEAVE", "LIGHT OFF", "LIGHT ON", "LIKE", "LOVE",
        "MAKE", "MEAN", "MEET", "NAME", "NEED", "NEVER", "NICE", "NOT", "OLD", "ON",
        "OUTSIDE", "PERSON", "PHONE NUMBER", "PLACE", "PLAN", "PLEASE", "POUR", "PREPARE",
        "PROMISE", "REPEAT", "ROOM", "SERVE", "SHIRT", "SILENCE", "SIT", "SLEEP", "SLOWER",
        "SOFTLY", "SOMEONE", "SOMETHING", "SORRY", "STUBBORN", "SURE", "TAKE", "TALK",
        "TELL", "THANK", "THERE", "THINGS", "THINK", "TIME", "TIRED", "TODAY", "TRAIN",
        "TRUST", "TRY", "UNDERSTAND", "WALK", "WANT", "WATER", "WAY", "WE", "WEAR", "WHAT",
        "WHEN", "WHERE", "WHICH", "WHO", "WHY", "WORRY", "YOU"
    ]


def get_all_dynamic_classes() -> list[str]:
    """Discover all sentence categories from Frames_Sentence_Level."""
    if SENTENCE_FRAMES_DIR.exists():
        dirs = [d.name for d in SENTENCE_FRAMES_DIR.iterdir() if d.is_dir()]
        if dirs:
            return sorted(dirs)
    return [
        "He is going into the room", "This place is beautiful", "are you free today",
        "are you hiding something", "bring water for me", "can i help you",
        "can you repeat that please", "comb your hair", "congratulations",
        "could you please talk slower", "do me a favour", "do not abuse him",
        "do not be stubborn", "do not hurt me", "do not make me angry",
        "do not take it to the heart", "do not worry", "do you need something",
        "go and sleep", "had your food", "he came by train", "he is on the way",
        "he she is my friend", "help me", "hi how are you", "how are things",
        "how can i help you", "how can i trust you", "how dare you", "how old are you",
        "i am afraid of that", "i am crying", "i am feeling bored", "i am feeling cold",
        "i am fine. thank you sir", "i am hungry", "i am in dilemma what to do",
        "i am not really sure", "i am really grateful", "i am sitting in the class",
        "i am so sorry to hear that", "i am suffering from fever", "i am tired",
        "i am very happy", "i can not help you there", "i do not agree", "i do not like it",
        "i do not mean it", "i dont agree", "i enjoyed a lot", "i got hurt",
        "i like you i love you", "i need water", "i promise", "i really appreciate it",
        "i somehow got to know about it", "i was stopped by some one",
        "it does not make any difference to me", "it was nice chatting with you",
        "let him take time", "my name is xxxxxxxx", "nice to meet you",
        "no need to worry dont worry", "now onwards he will never hurt you",
        "pour some more water into the glass", "prepare the bed", "serve the food",
        "shall we go outside", "speak softly", "take care of yourself", "tell me truth",
        "thank you so much", "that is so kind of you", "try to understand",
        "turn on light turn off light", "we are all with you", "wear the shirt",
        "what are you doing", "what did you tell him", "what do you do",
        "what do you think", "what do you want to become", "what happened",
        "what have you planned for your career", "what is your phone number",
        "what you want", "when will the train leave", "where are you from",
        "which college school are you from", "who are you", "why are you angry",
        "why are you crying", "why are you disappointed", "you are bad",
        "you are good", "you are welcome", "you can do it"
    ]


STATIC_CLASSES = get_all_static_classes()
DYNAMIC_CLASSES = get_all_dynamic_classes()

# Dynamic Sequence Settings
SEQUENCE_LENGTH = 30  # 30 frames per dynamic gesture

# Split Ratios
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

# Real-Time & Prediction Settings
CONFIDENCE_THRESHOLD = 0.65  # Minimum confidence to accept a prediction
SMOOTHING_WINDOW = 5         # Number of consecutive predictions for majority voting
DUPLICATE_COOLDOWN_FRAMES = 15  # Frames to wait before adding the same token again to sentence

# Camera Settings
CAMERA_INDEX = 0
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
