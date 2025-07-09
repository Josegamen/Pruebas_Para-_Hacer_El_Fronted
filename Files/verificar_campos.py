import os
import sys
import requests
from pdfminer.high_level import extract_text
from datetime import datetime
import fitz  # PyMuPDF
import re

CAMPOS_POR_PDF = {
    # Carta de radicacion de cuenta de cobro
    "filing_letter.pdf": {
        "nombre_alcaldesa": [
            "alexandra mejia guzman", "alcaldesa local",
            # ⚠️ Puede variar el nombre, considerar usar __REGEX__ si cambia
        ],
        "direccion_alcaldia": [
            "alcaldía local de chapinero", "carrera 13", "no. 54 – 74"
        ],
        "periodo_cobro": [
            "periodo comprendido del", "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "2025", "2024"
        ],
        "valor_en_letras": [
            "la suma de", "millones", "mil", "pesos", "$"
        ],
        "banco": ["banco", "lulo bank"],  # ⚠️ Puede cambiar el banco
        "numero_cuenta": [
            "__REGEX__NO. DE CUENTA:\\s*(\\d{6,})",
            "__REGEX__cuenta número:\\s*(\\d{6,})"  # ✔️ Se usa regex porque el número puede variar
        ],
        "tipo_de_cuenta": ["cuenta de ahorros", "cuenta corriente"],
        "firma": [" Validar visualmente"]
    },

    # Certificado de cumplimiento firmado
    "certificate_of_compliance.pdf": {
        # ⚠️ Todos estos campos pueden cambiar según el contratista
        "fecha_inicio": ["03 de enero de 2025", "03 de enero de 2025"],
        "fecha_fin": ["02 de marzo de 2025", "02 de marzo de 2025"],
        "Valor inicial pactado": ["$", "$17 ́082.000", "17082000", "__REGEX__valor inicial pactado:\\s*\\$?([0-9\\s\u0301\\.]+)"],
        "valor_pagar": ["$", "$17 ́082.000", "17082000", "__REGEX__valor por pagar:\\s*\\$?([0-9\\s\u0301\\.]+)"],
        "numero_pin": ["83713712", "__REGEX__numero de pin[:\\s]*([0-9]{5,})"]
    },

    # Informe de actividad
    "activity_report.pdf": {
        "tipo_contrato": ["CONTRATO DE PRESTACIÓN DE SERVICIOS ", "__REGEX__tipo de contrato[:\\s]*([a-z\\sáéíóúñ\\-]+)"],
        "numero_contrato_fecha": ["422-2024-CPS-P(124427) 3 ENERO 2025"],
        "nombre_contratista": ["ALBA STELLA FALKONERTH ROZO"],  # ⚠️ Puede cambiar
        "tipo_documento": ["Cédula de Ciudadanía 52779382"],  # ⚠️ Puede cambiar
        "plazo_ejecucion": ["DOS MESES (2) MESES"],
        "valor_total_contrato": ["$ 17.082.000 Diecisiete millones ochenta y dos mil peso"],
        "valor_periodo_cobro": [
            "$7.971.600 Siete millones novecientos setenta y un mil seiscientos peso"
        ],
        "numero_proyecto": ["[O23011605570000001741  (CHAPINERO  EJEMPLO  DE  GOBIERNO ABIERTO Y TRANSPARENCIA LOCAL)]"],
        "fecha_acta_inicio": ["03 ENERO DE 2025"],  # ⚠️ Puede cambiar
        "prorroga": ["N/A"],
        "adicion": ["N/A"],
        "suspension": ["N/A"],
        "fecha_prevista_terminacion": [
            "2 de marzo de 2025"  # ⚠️ Puede cambiar
        ]
    },

    # Certificado de calidad tributaria
    "tax_quality_certificate.pdf": {
        "numero_contrato": ["número de contrato"],
        "tabla_informacion_personal": ["x sí", "x no", "soy pensionado", "declaración de renta", "actividad económica"],
        "nombre": ["alba stella falkonerth rozo"],  # ⚠️ Puede cambiar
        "cedula": ["52779382"],  # ⚠️ Puede cambiar
        "direccion_correspondencia": ["calle 145", "correspondencia"],
        "telefono_contacto": ["3222806398"],  # ⚠️ Puede cambiar
        "correo_institucional": ["afalkonerth@gobiernobogota.gov.co"],  # ⚠️ Puede cambiar
        "correo_personal": ["annyf", "@gmail", "@hotmail"]  # ⚠️ Puede cambiar
    },

    # Seguridad social
    "social_security.pdf": {
        "verificado": [" Subido con éxito"]
    },

    # rut
    "rut.pdf": {
        "verificado": [" Subido con éxito"]
    },

    # rit
    "rit.pdf": {
        "verificado": [" Subido con éxito"]
    },

    # Capacitaciones
    "Trainings.pdf": {
        "imagenes_encontradas": ["__IMAGENES__"]
    },

    # Acta de inicio
    "initiation_record.pdf": {
        "nombre_contratista": ["FALKONERTH ROZO ALBA STELLA", "contratista", "nombre"],  # ⚠️ Puede cambiar
        "valor": ["$", "$17 ́082.000", "17082000", "__REGEX__valor por pagar:\\s*\\$?([0-9\\s\u0301\\.]+)"],
        "plazo": ["2 mes(es"],
        "firma_validar_visualmente": [" Validar visualmente"],
        "firmado_alcaldia_chapinero": [" Validar visualmente"]
    },

    # Certificación de cuenta
    "account_certification.pdf": {
        "verificado": ["__SUBIDO__"]
    }
}

# 📥 Argumentos recibidos desde Node.js
if len(sys.argv) < 3:
    print(" Faltan argumentos: <id_gestion_documental> <nombre_carpeta>")
    sys.exit(1)
    
id_gestion_documental = sys.argv[1]
nombre_carpeta = sys.argv[2]

CARPETA_PDFS = os.path.join(os.path.dirname(__file__), nombre_carpeta)

def extraer_texto(ruta_pdf):
    try:
        return extract_text(ruta_pdf).lower()
    except Exception as e:
        print(f" Error al extraer texto: {e}")
        return ""

def contiene_imagenes(ruta_pdf):
    try:
        doc = fitz.open(ruta_pdf)
        for page in doc:
            if len(page.get_images(full=True)) > 0:
                return True
        return False
    except Exception as e:
        print(f" Error verificando imágenes en {ruta_pdf}: {e}")
        return False
    
print(" ID recibido:", id_gestion_documental)
print(" Carpeta recibida:", nombre_carpeta)
print(" Ruta completa esperada:", CARPETA_PDFS)
def verificar_campos(texto, campos, archivo):
    resultados = {}
    lineas = texto.splitlines()

    for campo, palabras_clave in campos.items():
        if palabras_clave == [" Validar visualmente"]:
            resultados[campo] = " Validar visualmente"
        elif palabras_clave == [" Subido con éxito"]:
            resultados[campo] = " Subido con éxito"
        elif palabras_clave == ["__IMAGENES__"]:
            resultados[campo] = " Imágenes detectadas" if contiene_imagenes(os.path.join(CARPETA_PDFS, archivo)) else " No hay imágenes"
        elif palabras_clave == ["__SUBIDO__"]:
            resultados[campo] = " Subido con éxito"
        else:
            valor_encontrado = ""
            for clave in palabras_clave:
                if clave.startswith("__REGEX__"):
                    patron = clave.replace("__REGEX__", "")
                    for linea in lineas:
                        match = re.search(patron, linea, re.IGNORECASE)
                        if match:
                            valor_encontrado = match.group(1)
                            break
                else:
                    for linea in lineas:
                        if clave.lower() in linea.lower():
                            valor_encontrado = linea.strip()
                            break
                if valor_encontrado:
                    break
            resultados[campo] = valor_encontrado if valor_encontrado else "No encontrado"
    return resultados


def guardar_en_mongo(nombre_archivo, resultados, id_gestion_documental):
    url = "http://localhost:3000/api/Data/Saved"
    datos = {
        "archivo_pdf": nombre_archivo,
        "fecha_comparacion": datetime.now().isoformat(),
        "document_management": id_gestion_documental
    }
    for campo, estado in resultados.items():
        datos[campo] = estado

    try:
        res = requests.post(url, json=datos)
        if res.status_code == 201:
            print(f" Documento '{nombre_archivo}' guardado correctamente en MongoDB\n")
        else:
            print(f" Error al guardar: {res.status_code} - {res.text}\n")
    except Exception as e:
        print(f" Error de conexión al guardar en MongoDB: {e}\n")

# 🔁 Revisión por archivo (ordenados)
archivos_pdf_ordenados = sorted(
    [f for f in os.listdir(CARPETA_PDFS) if f.lower().endswith(".pdf")]
)


for archivo in archivos_pdf_ordenados:
    print(f"Verificando campos en: {archivo}")
    texto = extraer_texto(os.path.join(CARPETA_PDFS, archivo))
    with open("texto_extraido.txt", "w", encoding="utf-8") as f:
        f.write(texto)

    esquema = CAMPOS_POR_PDF.get(archivo.lower())
    if not esquema:
        print(" No hay esquema definido para este PDF. Se marca como subido.")
        resultados = {
            "verificado": "Subido sin validación",
            "nota": "Esquema no definido"
        }
        guardar_en_mongo(archivo, resultados, id_gestion_documental)
        continue

    resultados = verificar_campos(texto, esquema, archivo)

    print("===============================")
    print(" Campo               | Estado  ")
    print("===============================")
    for campo, estado in resultados.items():
        print(f" {campo:<20} | {estado}")
        print("===============================")

    guardar_en_mongo(archivo, resultados, id_gestion_documental)
