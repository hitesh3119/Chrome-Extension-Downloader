import os
import struct
import zipfile
import io
import urllib.request

EXTENSION_ID = "lankjdlpcafockikacbnbdngppglhjim"
DOWNLOAD_URL = (
    f"https://clients2.google.com/service/update2/crx?"
    f"response=redirect&prodversion=9999.0.0.0&os=win&arch=x86-64&nacl_arch=x86-64"
    f"&acceptformat=crx2,crx3&x=id%3D{EXTENSION_ID}%26installsource%3Dondemand%26uc"
)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CRX_FILE = os.path.join(SCRIPT_DIR, "sortlens.crx")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "sortlens_extension")

def download_crx():
    print(f"[*] Downloading SortLens CRX from Chrome Web Store...")
    print(f"[*] URL: {DOWNLOAD_URL}")
    req = urllib.request.Request(
        DOWNLOAD_URL,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    )
    with urllib.request.urlopen(req) as response, open(CRX_FILE, "wb") as out_file:
        data = response.read()
        out_file.write(data)
    print(f"[+] Downloaded {len(data)} bytes to: {CRX_FILE}")
    return CRX_FILE

def unpack_crx3(crx_path, extract_to_dir):
    print(f"[*] Unpacking CRX into '{extract_to_dir}'...")
    with open(crx_path, "rb") as f:
        magic = f.read(4)
        if magic != b"Cr24":
            raise ValueError(f"Invalid CRX magic bytes: {magic}")
        
        version = struct.unpack("<I", f.read(4))[0]
        print(f"[*] CRX Version: {version}")
        
        if version == 3:
            header_length = struct.unpack("<I", f.read(4))[0]
            f.seek(12 + header_length)
        elif version == 2:
            key_len = struct.unpack("<I", f.read(4))[0]
            sig_len = struct.unpack("<I", f.read(4))[0]
            f.seek(16 + key_len + sig_len)
        else:
            raise ValueError(f"Unsupported CRX version: {version}")
        
        zip_payload = f.read()

    os.makedirs(extract_to_dir, exist_ok=True)
    with zipfile.ZipFile(io.BytesIO(zip_payload)) as z:
        z.extractall(extract_to_dir)
    print(f"[SUCCESS] Extension extracted successfully to: {extract_to_dir}")

if __name__ == "__main__":
    try:
        download_crx()
        unpack_crx3(CRX_FILE, OUTPUT_DIR)
        print("\nAll done! You can now load this folder in Chrome:")
        print("1. Go to chrome://extensions/")
        print("2. Enable 'Developer mode' (top right toggle)")
        print(f"3. Click 'Load unpacked' and select: {OUTPUT_DIR}")
    except Exception as e:
        print(f"[!] Error: {e}")

