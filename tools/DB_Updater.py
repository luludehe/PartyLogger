import pandas as pd
import sys
import os
from sqlalchemy import create_engine

def extract_students(file_path, speciality):
    xls = pd.ExcelFile(file_path, engine='openpyxl')
    all_students = []

    for sheet in xls.sheet_names:
        # Extraire l'année à partir du nom de la feuille (ex: I1 → 1)
        year = sheet[-1] if sheet[-1].isdigit() else ''

        df = xls.parse(sheet, skiprows=5)

        if len(df.columns) == 4:
            df.columns = ['studentId', 'last_name', 'first_name', 'note']
        elif len(df.columns) == 5:
            df.columns = ['studentId', 'last_name', 'first_name', 'status', 'note']
            df = df.drop(columns=['status'])
        else:
            continue  # Feuille ignorée si structure inattendue

        df['studentId'] = pd.to_numeric(df['studentId'], errors='coerce')
        df = df.dropna(subset=['studentId'])
        df['studentId'] = df['studentId'].astype(int)
        df['last_name'] = df['last_name'].astype(str).str.strip()
        df['first_name'] = df['first_name'].astype(str).str.strip().str.title()
        df['speciality'] = f"{speciality}{year}"
        df['isMember'] = False

        all_students.append(df[['studentId', 'last_name', 'first_name', 'speciality', 'isMember']])

    return pd.concat(all_students, ignore_index=True)

def insert_into_database(df):
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Erreur : DATABASE_URL manquante.")
        sys.exit(1)

    engine = create_engine(db_url)
    df.to_sql("tmp_students_import", con=engine, if_exists="append", index=False)
    print("✔️ Données importées dans tmp_students_import.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_students_detect_speciality.py fichier.xlsx")
        sys.exit(1)

    file_path = sys.argv[1]

    if not os.path.exists(file_path):
        print(f"Fichier non trouvé: {file_path}")
        sys.exit(1)

    # Demander à l'utilisateur d'entrer la spécialité
    speciality = input("Entrez la spécialité (ASE, IR, T&F, Méca, GI) : ").strip()

    students_df = extract_students(file_path, speciality)
    insert_into_database(students_df)
