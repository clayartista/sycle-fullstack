import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logEvent } from '@/lib/observability';

const querySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().max(100000).optional(),
});

type WeatherResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
  };
};

type AirResponse = {
  current?: {
    time?: string;
    pm2_5?: number;
    us_aqi?: number;
  };
};

function weatherLabel(code = 0) {
  if (code === 0) return 'Cerah';
  if ([1, 2, 3].includes(code)) return 'Berawan';
  if ([45, 48].includes(code)) return 'Berkabut';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Gerimis';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Hujan';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Salju';
  if ([95, 96, 99].includes(code)) return 'Badai petir';
  return 'Berubah';
}

function aqiLabel(aqi: number | undefined) {
  if (aqi === undefined || !Number.isFinite(aqi)) return 'Tidak tersedia';
  if (aqi <= 50) return 'Baik';
  if (aqi <= 100) return 'Sedang';
  if (aqi <= 150) return 'Kurang sehat';
  if (aqi <= 200) return 'Tidak sehat';
  if (aqi <= 300) return 'Sangat tidak sehat';
  return 'Berbahaya';
}

export async function POST(request: Request) {
  const parsed = querySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Koordinat tidak valid.' }, { status: 400 });
  const { latitude, longitude } = parsed.data;

  try {
    const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
    weatherUrl.searchParams.set('latitude', String(latitude));
    weatherUrl.searchParams.set('longitude', String(longitude));
    weatherUrl.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code');
    weatherUrl.searchParams.set('timezone', 'auto');

    const airUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
    airUrl.searchParams.set('latitude', String(latitude));
    airUrl.searchParams.set('longitude', String(longitude));
    airUrl.searchParams.set('current', 'pm2_5,us_aqi');
    airUrl.searchParams.set('timezone', 'auto');

    const [weatherResponse, airResponse] = await Promise.all([fetch(weatherUrl, { cache: 'no-store' }), fetch(airUrl, { cache: 'no-store' })]);
    if (!weatherResponse.ok || !airResponse.ok) throw new Error('Environmental provider unavailable');

    const weather = (await weatherResponse.json()) as WeatherResponse;
    const air = (await airResponse.json()) as AirResponse;
    const current = weather.current;
    const airCurrent = air.current;
    if (current?.temperature_2m === undefined || current.apparent_temperature === undefined || current.relative_humidity_2m === undefined || current.weather_code === undefined || airCurrent?.pm2_5 === undefined) {
      throw new Error('Environmental provider returned incomplete data');
    }

    const payload = {
      location: 'Lokasi saat ini',
      envData: {
        temp: Math.round(current.temperature_2m * 10) / 10,
        feelsLike: Math.round(current.apparent_temperature * 10) / 10,
        humidity: Math.round(current.relative_humidity_2m),
        airQuality: aqiLabel(airCurrent.us_aqi),
        pm25: Math.round(airCurrent.pm2_5 * 10) / 10,
        weather: weatherLabel(current.weather_code),
        source: 'Open-Meteo',
        observedAt: current.time || airCurrent.time || new Date().toISOString(),
      },
      source: 'live',
    };

    logEvent('environment.live.success', { source: 'open-meteo' });
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    logEvent('environment.live.error', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'Kondisi lingkungan live belum tersedia. Coba lagi atau lanjutkan dengan data demo.' }, { status: 502 });
  }
}
