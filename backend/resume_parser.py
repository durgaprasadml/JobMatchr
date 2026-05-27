import os
import re
import fitz  # PyMuPDF
from docx import Document

def extract_text_from_pdf(file_path):
    """
    Extract all raw text from a PDF file using PyMuPDF (fitz).
    """
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        page_text = page.get_text()
        if page_text:
            text += page_text + "\n"
    return text

def extract_text_from_docx(file_path):
    """
    Extract all raw text from a DOCX file using python-docx.
    """
    doc = Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def clean_resume_text(text):
    """
    Clean extracted resume text by removing excessive spaces,
    normalizing repeated newlines, and cleaning broken formatting.
    """
    if not text:
        return ""
        
    # Replace multiple spaces with a single space
    cleaned = re.sub(r'[ \t]+', ' ', text)
    
    # Replace three or more newlines with double newlines (keeps paragraph separation clean)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    
    # Trim leading/trailing whitespace
    return cleaned.strip()

def parse_resume_file(file_path, filename):
    """
    Determine file type, extract text, clean it, and check that it's not empty.
    Raises ValueError if text cannot be extracted.
    """
    ext = filename.split(".")[-1].lower()
    
    if ext == "pdf":
        raw_text = extract_text_from_pdf(file_path)
    elif ext in ["docx", "doc"]:
        raw_text = extract_text_from_docx(file_path)
    else:
        # Fallback to general file read/decode
        with open(file_path, 'r', errors='ignore') as f:
            raw_text = f.read()
            
    cleaned_text = clean_resume_text(raw_text)
    
    if not cleaned_text:
        raise ValueError("Unable to extract text from resume.")
        
    return cleaned_text
