#!/usr/bin/env python3
"""
Script para verificar tu posición en Google para keywords específicas
Uso: python check-google-ranking.py
"""

import requests
from bs4 import BeautifulSoup
import time
import json
from datetime import datetime

# Configuración
DOMAIN = "resonaevents.com"
KEYWORDS = [
    "alquiler altavoces valencia",
    "alquiler sonido valencia",
    "alquiler iluminacion valencia",
    "alquiler sonido bodas valencia",
    "produccion eventos valencia"
]

def check_ranking(keyword, domain, max_results=100):
    """
    Verifica la posición de un dominio en Google para una keyword
    """
    print(f"\n🔍 Buscando: '{keyword}'...")
    
    try:
        # Construir URL de búsqueda
        url = f"https://www.google.es/search?q={keyword.replace(' ', '+')}&num={max_results}"
        
        # Headers para simular navegador
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'es-ES,es;q=0.9',
        }
        
        # Hacer request
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ Error: Status code {response.status_code}")
            return None
        
        # Parsear HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Buscar resultados orgánicos
        results = soup.find_all('div', class_='g')
        
        position = None
        for index, result in enumerate(results, start=1):
            link = result.find('a')
            if link and 'href' in link.attrs:
                url = link['href']
                if domain in url:
                    position = index
                    break
        
        if position:
            print(f"✅ Posición: #{position}")
            if position <= 10:
                print(f"   🎉 ¡Estás en la primera página!")
            elif position <= 20:
                print(f"   📈 Segunda página - cerca del top 10")
            else:
                print(f"   📊 Posición {position}")
        else:
            print(f"❌ No encontrado en las primeras {max_results} posiciones")
        
        return position
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def main():
    print("=" * 60)
    print("🔍 VERIFICADOR DE RANKING EN GOOGLE")
    print("=" * 60)
    print(f"Dominio: {DOMAIN}")
    print(f"Keywords: {len(KEYWORDS)}")
    print("=" * 60)
    
    results = {}
    
    for keyword in KEYWORDS:
        position = check_ranking(keyword, DOMAIN)
        results[keyword] = position
        
        # Esperar entre requests para no ser bloqueado
        time.sleep(3)
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE POSICIONES:")
    print("=" * 60)
    
    for keyword, position in results.items():
        if position:
            emoji = "🥇" if position <= 3 else "🥈" if position <= 10 else "🥉" if position <= 20 else "📍"
            print(f"{emoji} {keyword:<40} #{position}")
        else:
            print(f"❌ {keyword:<40} No encontrado")
    
    # Guardar resultados
    output = {
        'timestamp': datetime.now().isoformat(),
        'domain': DOMAIN,
        'results': results
    }
    
    filename = f"ranking-results-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Resultados guardados en: {filename}")
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
