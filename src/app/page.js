'use client';

import { useState, useRef } from 'react';

// Função para calcular a distância entre duas coordenadas (Fórmula de Haversine em metros)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371000; 
  const rad = (graus) => (graus * Math.PI) / 180;

  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Retorna distância em metros
}

export default function Home() {
  const [leitura, setLeitura] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState(null);

  // Estados do Desafio
  const [rastreando, setRastreando] = useState(false);
  const [contador, setContador] = useState(0);
  const [primeiraLeitura, setPrimeiraLeitura] = useState(null);
  const [distanciaPercorrida, setDistanciaPercorrida] = useState(0);

  // Referência para guardar o ID do watchPosition
  const watchIdRef = useRef(null);

  function traduzirErroGPS(e) {
    switch (e.code) {
      case e.PERMISSION_DENIED:
        return "Permissão de localização negada pelo usuário.";
      case e.POSITION_UNAVAILABLE:
        return "Informações de localização indisponíveis.";
      case e.TIMEOUT:
        return "Tempo limite esgotado ao buscar localização.";
      default:
        return "Erro desconhecido ao obter localização.";
    }
  }

  // Atualiza os dados de leitura e calcula distância
  function processarPosicao(posicao) {
    const coords = posicao.coords;
    const novaLeitura = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude: coords.altitude !== null ? `${coords.altitude.toFixed(1)} m` : "N/A",
      precisao: coords.accuracy !== null ? `${coords.accuracy.toFixed(1)} m` : "N/A",
      horario: new Date(posicao.timestamp).toLocaleTimeString("pt-BR"),
    };

    setLeitura(novaLeitura);
    setContador((prev) => prev + 1);

    // Salva a primeira leitura e calcula a distância percorrida
    setPrimeiraLeitura((prevPrimeira) => {
      if (!prevPrimeira) {
        return { latitude: coords.latitude, longitude: coords.longitude };
      } else {
        const dist = calcularDistancia(
          prevPrimeira.latitude,
          prevPrimeira.longitude,
          coords.latitude,
          coords.longitude
        );
        setDistanciaPercorrida(dist);
        return prevPrimeira;
      }
    });

    setBuscando(false);
  }

  // 1. Leitura Pontual (getCurrentPosition)
  function buscarPosicao() {
    if (!navigator.geolocation) {
      setErro("Este navegador não suporta a Geolocation API.");
      return;
    }

    setBuscando(true);
    setErro(null);

    navigator.geolocation.getCurrentPosition(
      processarPosicao,
      (e) => {
        setErro(traduzirErroGPS(e));
        setBuscando(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  // Rastreamento Contínuo (watchPosition)
  function alternarRastreamento() {
    if (!navigator.geolocation) {
      setErro("Este navegador não suporta a Geolocation API.");
      return;
    }

    if (rastreando) {
      // Parar Rastreamento
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setRastreando(false);
    } else {
      // Iniciar Rastreamento
      setRastreando(true);
      setErro(null);

      const id = navigator.geolocation.watchPosition(
        processarPosicao,
        (e) => {
          setErro(traduzirErroGPS(e));
          setRastreando(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
      watchIdRef.current = id;
    }
  }

  // Monta a URL do OpenStreetMap
  function montarUrlMapa(lat, lng) {
    return (
      `https://www.openstreetmap.org/export/embed.html` +
      `?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}` +
      `&layer=mapnik&marker=${lat},${lng}`
    );
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Aplicação GPS</h1>

      {/* Botões de Ação */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={buscarPosicao}
          disabled={buscando || rastreando}
          style={{ padding: '10px 15px', cursor: 'pointer', borderRadius: '5px' }}
        >
          {buscando ? "Buscando..." : "Obter Posição Atual"}
        </button>

        <button
          onClick={alternarRastreamento}
          style={{
            padding: '10px 15px',
            cursor: 'pointer',
            borderRadius: '5px',
            backgroundColor: rastreando ? '#ef4444' : '#22c55e',
            color: 'white',
            border: 'none'
          }}
        >
          {rastreando ? "Parar Rastreamento" : "Iniciar Rastreamento Contínuo"}
        </button>
      </div>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {/* Exibição dos Dados do GPS */}
      {leitura && (
        <div style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#0f172a' }}>
          <h2>Dados da Leitura:</h2>
          <p><strong>Latitude:</strong> {leitura.latitude}</p>
          <p><strong>Longitude:</strong> {leitura.longitude}</p>
          <p><strong>Altitude:</strong> {leitura.altitude}</p>
          <p><strong>Precisão:</strong> {leitura.precisao}</p>
          <p><strong>Última atualização:</strong> {leitura.horario}</p>

          <hr style={{ margin: '15px 0' }} />

          {/* Desafio: Contador e Distância */}
          <h3>Estatísticas do Desafio:</h3>
          <p><strong>Total de Atualizações:</strong> {contador}</p>
          <p>
            <strong>Distância Percorrida:</strong>{" "}
            {distanciaPercorrida >= 1000
              ? `${(distanciaPercorrida / 1000).toFixed(2)} km`
              : `${distanciaPercorrida.toFixed(1)} metros`}
          </p>
        </div>
      )}

      {/* Mapa do OpenStreetMap */}
      {leitura && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Localização no Mapa</h2>
          <iframe
            title="Mapa GPS"
            width="100%"
            height="350"
            frameBorder="0"
            src={montarUrlMapa(leitura.latitude, leitura.longitude)}
            style={{ borderRadius: '8px' }}
          />
        </div>
      )}

      {/* Tabela Comparativa React vs Android Studio */}
      <section style={{ marginTop: '30px' }}>
        <h2>Comparação: Android Studio vs Next.js (React)</h2>
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#e2e8f0', color: '#0f172a' }}>
              <th>Conceito</th>
              <th>Android Studio (Java/Kotlin)</th>
              <th>Next.js (React Web)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Atributos/Estado</strong></td>
              <td><code>public static double latitude</code></td>
              <td><code>const [leitura, setLeitura] = useState()</code></td>
            </tr>
            <tr>
              <td><strong>Gerenciador GPS</strong></td>
              <td><code>LocationManager</code></td>
              <td><code>navigator.geolocation</code></td>
            </tr>
            <tr>
              <td><strong>Leitura Única</strong></td>
              <td><code>getLastKnownLocation()</code></td>
              <td><code>getCurrentPosition()</code></td>
            </tr>
            <tr>
              <td><strong>Rastreamento Contínuo</strong></td>
              <td><code>requestLocationUpdates()</code></td>
              <td><code>watchPosition()</code></td>
            </tr>
            <tr>
              <td><strong>Exibição de Mapa</strong></td>
              <td><code>WebView</code> / Google Maps SDK</td>
              <td><code>&lt;iframe&gt;</code> OpenStreetMap Embed</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}