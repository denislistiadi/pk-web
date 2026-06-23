import math
import re
from collections import Counter
from typing import List, Dict

def tokenize(text: str) -> List[str]:
    return re.findall(r'\w+', text.lower())

def compute_tf(text: str) -> Dict[str, float]:
    tokens = tokenize(text)
    total = len(tokens)
    if total == 0:
        return {}
    counts = Counter(tokens)
    return {word: count / total for word, count in counts.items()}

def compute_idf(documents: List[str]) -> Dict[str, float]:
    n = len(documents)
    if n == 0:
        return {}
    doc_freq: Dict[str, int] = {}
    for doc in documents:
        words = set(tokenize(doc))
        for word in words:
            doc_freq[word] = doc_freq.get(word, 0) + 1
    return {word: math.log(n / (1 + df)) + 1 for word, df in doc_freq.items()}

def compute_tfidf(text: str, idf: Dict[str, float]) -> Dict[str, float]:
    tf = compute_tf(text)
    return {word: tf_val * idf.get(word, 0.01) for word, tf_val in tf.items()}

def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    all_words = set(vec1.keys()) | set(vec2.keys())
    dot = sum(vec1.get(w, 0) * vec2.get(w, 0) for w in all_words)
    norm1 = math.sqrt(sum(v * v for v in vec1.values()))
    norm2 = math.sqrt(sum(v * v for v in vec2.values()))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

def jaccard_similarity(set1: set, set2: set) -> float:
    if not set1 and not set2:
        return 0.0
    union = set1 | set2
    inter = set1 & set2
    if not union:
        return 0.0
    return len(inter) / len(union)

def skor_pendidikan(pendidikan: str, minimal: str) -> float:
    TINGKAT = ["SD", "SMP", "SMA/SMK", "D1/D3", "S1/D4", "S2", "S3"]
    try:
        idx = TINGKAT.index(pendidikan)
        min_idx = TINGKAT.index(minimal)
    except ValueError:
        return 0.0
    if idx >= min_idx:
        return 100.0
    return max(0.0, 100.0 - (min_idx - idx) * 25.0)

def skor_umur(umur: int, min_u: int, max_u: int) -> float:
    if min_u <= umur <= max_u:
        return 100.0
    if umur < min_u:
        return max(0.0, 100.0 - (min_u - umur) * 10.0)
    return max(0.0, 100.0 - (umur - max_u) * 10.0)
