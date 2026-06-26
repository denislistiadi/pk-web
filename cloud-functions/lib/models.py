from pydantic import BaseModel, Field
from typing import List, Optional

class KecamatanOut(BaseModel):
    id: int
    nama: str

class DesaOut(BaseModel):
    id: int
    nama: str
    kecamatan_id: int
    kecamatan: Optional[str] = None
    paslon_count: Optional[int] = None

class PaslonOut(BaseModel):
    id: int
    desa_id: int
    nomor_urut: int
    nama: str
    visi: str
    misi: List[str]
    pendidikan: str
    umur: int
    foto_url: Optional[str] = None

class DesaDetailOut(BaseModel):
    id: int
    nama: str
    kecamatan_id: int
    kecamatan: Optional[str] = None
    paslon: List[PaslonOut]

class CocokkanRequest(BaseModel):
    desa_id: int
    visi_user: str = Field(..., min_length=1)
    misi_user: List[int] = Field(default_factory=list)
    pendidikan_min: str = "SD"
    umur_min: int = Field(default=25, ge=17, le=70)
    umur_max: int = Field(default=60, ge=17, le=70)

class CocokkanResult(BaseModel):
    paslon_id: int
    nama: str
    nomor_urut: int
    skor_visi: float
    skor_misi: float
    skor_pendidikan: float
    skor_umur: float
    skor_total: float
    summary: str = ""

class CocokkanResponse(BaseModel):
    desa: str
    results: List[CocokkanResult]
    user_input: dict

class CompareResponse(BaseModel):
    desa: str
    paslon: List[PaslonOut]
