// Centros de acopio (donaciones) — fuente: Google Sheet compartida.
// Se intenta leer EN VIVO el CSV publicado (revalidado), con un respaldo
// estático embebido por si la hoja no responde, así la página nunca queda vacía.

export interface Acopio {
  who: string;
  address: string;
  lat: number | null;
  lng: number | null;
  city: string;
  receives: string;
  contact: string;
}

export const ACOPIOS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1OTNQGMsK3nU2wqy00rtPPcwsSzAlorWeP-uIotWpkxM/export?format=csv";

// Parser CSV minimalista (respeta comillas y comas internas).
function parseCsv(t: string): string[][] {
  const rows: string[][] = [];
  let f = "", row: string[] = [], q = false;
  const push = () => { row.push(f); f = ""; };
  const end = () => { push(); rows.push(row); row = []; };
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    const code = t.charCodeAt(i);
    if (q) {
      if (ch === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += ch;
    } else {
      if (ch === '"') q = true;
      else if (ch === ",") push();
      else if (code === 10) end();
      else if (code === 13) { /* skip CR */ }
      else f += ch;
    }
  }
  if (f.length || row.length) end();
  return rows;
}

function coords(s: string): { lat: number | null; lng: number | null } {
  const m = (s || "").match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  return m ? { lat: parseFloat(m[1]), lng: parseFloat(m[2]) } : { lat: null, lng: null };
}

export function parseAcopiosCsv(text: string): Acopio[] {
  const rows = parseCsv(text).slice(1);
  return rows
    .filter((r) => r.some((c) => c && c.trim()))
    .map((r) => {
      const c = coords(r[3]);
      return {
        who: (r[1] || "").trim(),
        address: (r[2] || "").trim(),
        lat: c.lat,
        lng: c.lng,
        city: (r[4] || "").trim(),
        receives: (r[6] || "").trim(),
        contact: (r[7] || "").trim(),
      };
    })
    .filter((x) => x.who || x.address);
}

/** Lee los centros en vivo (revalida cada 30 min); si falla, usa el respaldo. */
export async function getAcopios(): Promise<Acopio[]> {
  try {
    const res = await fetch(ACOPIOS_CSV_URL, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const parsed = parseAcopiosCsv(await res.text());
    return parsed.length ? parsed : ACOPIOS_FALLBACK;
  } catch {
    return ACOPIOS_FALLBACK;
  }
}

export const ACOPIOS_FALLBACK: Acopio[] = [
  {
    "who": "Comando Con Venezuela",
    "address": "Av. Marqués del Pumar diagonal al Hotel Comercio Casa Azul",
    "lat": 8.62573709435974,
    "lng": -70.21770857282739,
    "city": "Barinas",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": ""
  },
  {
    "who": "Comando Con Venezuela",
    "address": "Municipio Ezequiel Zamora Restaurant O'Maria Carrera 5 con calles 18 y 19, Santa Bárbara de Barinas",
    "lat": 7.814516915481565,
    "lng": -71.18114411841017,
    "city": "Barinas",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": "0424714 10 72 — 0424 7463080"
  },
  {
    "who": "Comando Con Venezuela",
    "address": "Municipio Cruz Paredes Av Bolívar diagonal al Hotel del Búfalo Casa Azul Barrancas",
    "lat": null,
    "lng": null,
    "city": "Barinas",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": "4145298154"
  },
  {
    "who": "Sociedad civil",
    "address": "Tatas Food, carrera 15 entre calles 13A y 13B",
    "lat": 10.05968145700956,
    "lng": -69.35052676449241,
    "city": "Barquisimeto",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": ""
  },
  {
    "who": "Voluntariado Higea",
    "address": "Biotel Suites",
    "lat": 10.068303772615856,
    "lng": -69.35608257982146,
    "city": "Barquisimeto",
    "receives": "Alimentos no perecederos, medicinas, insumos médicos, cobijas y ropa",
    "contact": "https://www.instagram.com/voluntariadohigea?igsh=MXBxYXAzdHh3cnBsdg=="
  },
  {
    "who": "Voluntariado Higea",
    "address": "Fundación Higea",
    "lat": 10.078761563516972,
    "lng": -69.31019102553456,
    "city": "Barquisimeto",
    "receives": "Alimentos no perecederos, medicinas, insumos médicos, cobijas y ropa",
    "contact": "https://www.instagram.com/voluntariadohigea?igsh=MXBxYXAzdHh3cnBsdg=="
  },
  {
    "who": "Colegio Las Colinas",
    "address": "Colegio Las Colinas, entrada El Pedregal",
    "lat": 10.060280973564453,
    "lng": -69.28194966447327,
    "city": "Barquisimeto",
    "receives": "Herramientas, insumos médicos y medicamentos",
    "contact": "https://www.instagram.com/colegiolascolinas1969?igsh=MWt6cG5taHg2d2N5bA=="
  },
  {
    "who": "Cámara de Comercio de Bolívar",
    "address": "Sede de la Cámara de Comercio e Industrias del estado Bolívar, av Táchira",
    "lat": 8.132865010459682,
    "lng": -63.54410565096583,
    "city": "Bolívar",
    "receives": "Agua, alimentos, insumos médicos, artículos de higiene, ropa y sábanas",
    "contact": "@camaradecomerciobolivar"
  },
  {
    "who": "Comando Con Venezuela",
    "address": "Municipio Caroní: Centro Comercial Biblos. Primer piso, Local 71 C. Antes Todo limpio (Frente a los trailer de Bauxilum y al lado de la Bomba Biblos) Unare II.",
    "lat": 8.277558393864988,
    "lng": -62.756148650924466,
    "city": "Bolívar",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": "https://www.instagram.com/p/DZ_0rjlljwk/?igsh=MWJwbTk1MXhhYWtkcg%3D%3D"
  },
  {
    "who": "Comando Con Venezuela",
    "address": "Municipio Heres: Av Pichincha Edificio Tequendama Local No 4.",
    "lat": 8.128589043462492,
    "lng": -63.54621670884486,
    "city": "Bolívar",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": "https://www.instagram.com/p/DZ_0rjlljwk/?igsh=MWJwbTk1MXhhYWtkcg%3D%3D"
  },
  {
    "who": "Fitness Factory Cabudare",
    "address": "CC Hipermercado Multimall, Avenida El Placer, con Av. Libertador,",
    "lat": 10.037954617697917,
    "lng": -69.27696848530664,
    "city": "Cabudare",
    "receives": "Agua, alimentos no perecederos, productos de higiene personal, pañales, formula para bebés, cobijas, mantas y ropa en buen estado",
    "contact": "https://www.instagram.com/p/DaApx5TAAkN/?img_index=1&igsh=MWprOWNwODh2eHowdA=="
  },
  {
    "who": "Rescatistas y vecinos",
    "address": "Edificio Petunia, Av Francisco de Miranda entre Los Palos Grandes y Altamira",
    "lat": 10.497912389016717,
    "lng": -66.8477711386003,
    "city": "Caracas",
    "receives": "Agua, alimentos no perecederos",
    "contact": ""
  },
  {
    "who": "Rescatistas y vecinos",
    "address": "Altamira, frente a la sede de la CAF",
    "lat": 10.498929331667387,
    "lng": -66.84832596634126,
    "city": "Caracas",
    "receives": "Agua, alimentos no perecederos",
    "contact": "Victoria Castillo 04121937746/Desireé Lugo 04249050118"
  },
  {
    "who": "Comando Con Venezuela",
    "address": "Cuarta avenida de Altamira, entre novena y décima transversal; quinta El Bejucal.",
    "lat": 10.510624523203594,
    "lng": -66.85290362216404,
    "city": "Caracas",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": "https://www.instagram.com/p/DZ_kBlyIVRI/?hl=es"
  },
  {
    "who": "Comando Con Venezuela",
    "address": "Iglesia La Paz en Montalbán I. Municipio Libertador",
    "lat": 10.475873230212263,
    "lng": -66.95059189251715,
    "city": "Caracas",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": "https://www.instagram.com/p/DZ_puvBIAO3/?hl=es"
  },
  {
    "who": "Comando Con Venezuela",
    "address": "Iglesia San Bernardino de Siena. Parroquia San Bernardino.",
    "lat": 10.513941471752892,
    "lng": -66.90172426453836,
    "city": "Caracas",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": "https://www.instagram.com/p/DZ_puvBIAO3/?hl=es"
  },
  {
    "who": "Sociedad civil",
    "address": "Quinta el Bejucal, cuarta av transversal de Altamira, entre novena y décima transversal",
    "lat": null,
    "lng": null,
    "city": "Caracas",
    "receives": "Ropa, medicamentos e insumos, agua, alimentos no perecederos, lencería",
    "contact": ""
  },
  {
    "who": "Cáritas Venezuela",
    "address": "Sede de la conferencia Episcopal Venezolana, Avenida Teherán, a 200 metros de la Universidad Católica Andrés Bello (UCAB), frente a la Urbanización Juan Pablo II, en el sector de Montalbán.",
    "lat": 10.46728347692278,
    "lng": -66.96836523568012,
    "city": "Caracas",
    "receives": "",
    "contact": ""
  },
  {
    "who": "Fundación Cruz Azul",
    "address": "Fitness factory VE, 4 avenida de Los Palos Grandes entre 1ra y 2da transversal",
    "lat": 10.502559221824809,
    "lng": -66.84659049334614,
    "city": "Caracas",
    "receives": "Insumos médicos",
    "contact": "https://www.instagram.com/cruzazulusm"
  },
  {
    "who": "Instituto de Diseño de Caracas",
    "address": "Av. Ávila, Caracas 1060, Miranda",
    "lat": 10.497144822463262,
    "lng": -66.8532426645166,
    "city": "Caracas",
    "receives": "Agua potable, ropa (prioridad sueteres) cobijas, comida, insumos medicos, linternas, cascos, martillos, chalecos, artículos de higiene",
    "contact": "4123212782"
  },
  {
    "who": "Gobierno de Venezuela",
    "address": "Fundación Social Bolívar (Sede 911)",
    "lat": null,
    "lng": null,
    "city": "Caroní",
    "receives": "Alimentos no perecederos, agua, medicamentos y ropa en buen estado",
    "contact": ""
  },
  {
    "who": "Gobierno de Venezuela",
    "address": "Mundo de Sonrisas",
    "lat": 8.128437741164435,
    "lng": -63.54454026384825,
    "city": "Ciudad Bolívar",
    "receives": "Alimentos no perecederos, agua, medicamentos y ropa en buen estado",
    "contact": ""
  },
  {
    "who": "Rotaract Santo Ángel",
    "address": "Croquínea a un lado de la Clínica Razzeti, Altavista",
    "lat": 8.295134005207371,
    "lng": -62.734084411562236,
    "city": "Ciudad Guayana",
    "receives": "Agua, alimentos no perecederos, enlatados, productos de higiene personal, pañalaes, toallas sanitarias, insumos médicos, lencería, comida para animales",
    "contact": "Victoria Castillo 04121937746/Desireé Lugo 04249050118"
  },
  {
    "who": "Rotaract Santo Ángel",
    "address": "Laboratorio Roraima Clínica Humana San Felix",
    "lat": 8.361775298738507,
    "lng": -62.666026474127676,
    "city": "Ciudad Guayana",
    "receives": "Venezuela",
    "contact": "Victoria Castillo 04121937746/Desireé Lugo 04249050118"
  },
  {
    "who": "Rotaract Santo Ángel",
    "address": "UCAB Guayana Extensión Social Universitaria",
    "lat": 8.297310424794086,
    "lng": -62.711355704982545,
    "city": "Ciudad Guayana",
    "receives": "Agua, alimentos no perecederos, enlatados, productos de higiene personal, pañalaes, toallas sanitarias, insumos médicos, lencería, comida para animales",
    "contact": "Victoria Castillo 04121937746/Desireé Lugo 04249050118"
  },
  {
    "who": "Rotaract Santo Ángel",
    "address": "Terraza Box Villa Alianza junto a la clínica Santa Isabel",
    "lat": 8.30609708958305,
    "lng": -62.7188576043689,
    "city": "Ciudad Guayana",
    "receives": "Agua, alimentos no perecederos, enlatados, productos de higiene personal, pañalaes, toallas sanitarias, insumos médicos, lencería, comida para animales",
    "contact": "Victoria Castillo 04121937746/Desireé Lugo 04249050118"
  },
  {
    "who": "Rotaract Santo Ángel",
    "address": "Crazy Pets Orinokia Mall",
    "lat": 8.292619625030907,
    "lng": -62.741633079795804,
    "city": "Ciudad Guayana",
    "receives": "Agua, alimentos no perecederos, enlatados, productos de higiene personal, pañalaes, toallas sanitarias, insumos médicos, lencería, comida para animales",
    "contact": "Victoria Castillo 04121937746/Desireé Lugo 04249050118"
  },
  {
    "who": "Sociedad civil",
    "address": "FCU-UCV",
    "lat": 10.491838298877855,
    "lng": -66.88887722244455,
    "city": "Distrito Capital",
    "receives": "Ropa, medicamentos e insumos, agua, alimentos no perecederos, lencería",
    "contact": ""
  },
  {
    "who": "Sociedad civil",
    "address": "Frente a la iglesia Rumana en la entrada a la vía de La Unión",
    "lat": null,
    "lng": null,
    "city": "El Hatillo",
    "receives": "URGENTE:  alimento para bebés y pañales.",
    "contact": "0414/2384085"
  },
  {
    "who": "Sociedad civil",
    "address": "Burger Latin, centro comercial Palma Center",
    "lat": null,
    "lng": null,
    "city": "La Victoria",
    "receives": "Agua, baterías, alimentos para mascotas, insumos médicos, ropa en buen estado, pañales, palaes y picos",
    "contact": "https://www.instagram.com/p/DaAk8GWOLGH/?igsh=MXB2NDFyNzlheG54Nw%3D%3D"
  },
  {
    "who": "Sociedad civil",
    "address": "Bodega 33, centro comercial El Solidario",
    "lat": null,
    "lng": null,
    "city": "La Victoria",
    "receives": "Agua, baterías, alimentos para mascotas, insumos médicos, ropa en buen estado, pañales, palaes y picos",
    "contact": "https://www.instagram.com/p/DaAk8GWOLGH/?igsh=MXB2NDFyNzlheG54Nw%3D%3D"
  },
  {
    "who": "Sociedad civil",
    "address": "CEI María de las Mercedes Calle Dr Vicentelli c/c Rosa María Paredes #7 Sector Centro",
    "lat": null,
    "lng": null,
    "city": "La Victoria",
    "receives": "Insumos médicos, agua potable, alimentos no perecederos, artículos de higiene persona, pañales, fórmulas infantiles",
    "contact": "Dr Jhander Delgago 4243573790 Kevin Campos 4124224314"
  },
  {
    "who": "Sociedad civil",
    "address": "Parroquia Nuestra Señora del Carmen, calle Colón",
    "lat": null,
    "lng": null,
    "city": "La Victoria",
    "receives": "Insumos médicos, agua potable, alimentos no perecederos, artículos de higiene persona, pañales, fórmulas infantiles",
    "contact": "Dr Jhander Delgago 4243573790 Kevin Campos 4124224314"
  },
  {
    "who": "Sociedad civil",
    "address": "Playa Mansa",
    "lat": null,
    "lng": null,
    "city": "Lecheria, Anzoategui",
    "receives": "Alimentos no perecederos, agua, medicamentos y ropa en buen estado",
    "contact": "desde las 10 am hasta las 6 pm aprox."
  },
  {
    "who": "Un Nuevo Tiempo",
    "address": "Sede regional Un Nuevo Tiempo",
    "lat": null,
    "lng": null,
    "city": "Maracaibo",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": ""
  },
  {
    "who": "Vente Zulia",
    "address": "Calle 70 con av 15A y 15B N15A-39, calle paralela a Nebabrica",
    "lat": null,
    "lng": null,
    "city": "Maracaibo",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": ""
  },
  {
    "who": "Comando Con Venezuela",
    "address": "Avenida 19 de Abril Centro Comercial La Capilla Piso 1 Local 21",
    "lat": null,
    "lng": null,
    "city": "Maracay",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": "https://www.instagram.com/p/DZ_kBlyIVRI/?hl=es"
  },
  {
    "who": "Voluntad Popular",
    "address": "Paseo de la Libertidad, Avenida Las Delecias, frente al Centro Médico Maracay",
    "lat": null,
    "lng": null,
    "city": "Maracay",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": ""
  },
  {
    "who": "Voluntad Popular",
    "address": "Calle 6, Antigua Bermúdez, casa N11, antiguo restaurante El Oeste",
    "lat": null,
    "lng": null,
    "city": "Maturín",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": ""
  },
  {
    "who": "Sociedad civil",
    "address": "Colegio de Médicos",
    "lat": null,
    "lng": null,
    "city": "Mérida",
    "receives": "Ropa, medicamentos e insumos, agua, alimentos no perecederos, lencería",
    "contact": ""
  },
  {
    "who": "Animales Sin Nombre",
    "address": "CC EL Rodeo / Contactarlos",
    "lat": null,
    "lng": null,
    "city": "Mérida",
    "receives": "alimento para los animalitos, medicinas, antidiarreicos",
    "contact": "https://www.instagram.com/_asn?igsh=MWUxbTI2OWx4ZzJlYQ=="
  },
  {
    "who": "Rotaract Táchira",
    "address": "Brave Community Fitness, al lado del hotel Manuel",
    "lat": null,
    "lng": null,
    "city": "San Antonio",
    "receives": "Medicinas, agua, comida no perecedera, comida de animales, powerbanks",
    "contact": "573508741816"
  },
  {
    "who": "Sociedad civil",
    "address": "Madeco Av Cuatricentenaria",
    "lat": null,
    "lng": null,
    "city": "San Cristóbal",
    "receives": "Comida, ropa, agua, insumos médicos",
    "contact": ""
  },
  {
    "who": "Rotaract Táchira",
    "address": "Revista Rotaria, frente a la Cruz Roja",
    "lat": null,
    "lng": null,
    "city": "San Cristóbal",
    "receives": "Medicinas, agua, comida no perecedera, comida de animales, powerbanks",
    "contact": "0414-7121207"
  },
  {
    "who": "Rotaract Táchira",
    "address": "Edificio Rotario Dr Augusto Peña Sosa Piso 2 Avenida 19 de abril",
    "lat": null,
    "lng": null,
    "city": "San Cristóbal",
    "receives": "Medicinas, agua, comida no perecedera, comida de animales, powerbanks",
    "contact": ""
  },
  {
    "who": "Sociedad civil",
    "address": "UCAT, sede vieja",
    "lat": null,
    "lng": null,
    "city": "Táchira",
    "receives": "Ropa, medicamentos e insumos, agua, alimentos no perecederos, lencería",
    "contact": ""
  },
  {
    "who": "Sociedad civil",
    "address": "ULA",
    "lat": null,
    "lng": null,
    "city": "Táchira",
    "receives": "Ropa, medicamentos e insumos, agua, alimentos no perecederos, lencería",
    "contact": ""
  },
  {
    "who": "Sociedad civil",
    "address": "UNET. Edificio A sede de Ing Civil",
    "lat": null,
    "lng": null,
    "city": "Táchira",
    "receives": "Ropa, medicamentos e insumos, agua, alimentos no perecederos, lencería",
    "contact": ""
  },
  {
    "who": "Rotaract Táchira",
    "address": "Centro Médico Rotario César Dario González",
    "lat": null,
    "lng": null,
    "city": "Tariba",
    "receives": "Medicinas, agua, comida no perecedera, comida de animales, powerbanks",
    "contact": "2763949051"
  },
  {
    "who": "Sociedad civil",
    "address": "Municipio Trujillo Capital. Centro Comercial Plaza Marina. Local 30",
    "lat": null,
    "lng": null,
    "city": "Trujillo",
    "receives": "Insumos médicos, alimentos no perecederos, ropa en buen estado",
    "contact": "Luis Pulgar (04126840791)"
  },
  {
    "who": "Sociedad civil",
    "address": "Municipio Sucre: Urb. El Trompillo 2, parroquia Valmore Rodriguez, casa #39 (Casa Delgado)",
    "lat": null,
    "lng": null,
    "city": "Trujillo",
    "receives": "Insumos médicos, alimentos no perecederos, ropa en buen estado",
    "contact": "Gabriela Delgado (04121644063)"
  },
  {
    "who": "Sociedad civil",
    "address": "Municipio Pampanito: Pampanito I, Urb. Villa Hermosa, 4ta calle, Casa num 377",
    "lat": null,
    "lng": null,
    "city": "Trujillo",
    "receives": "Insumos médicos, alimentos no perecederos, ropa en buen estado",
    "contact": "Laudelino Vásquez (04129843407)"
  },
  {
    "who": "Gobierno de Venezuela",
    "address": "Casa de la Mujer",
    "lat": null,
    "lng": null,
    "city": "Upata",
    "receives": "Alimentos no perecederos, agua, medicamentos y ropa en buen estado",
    "contact": ""
  },
  {
    "who": "Jóvenes por el clima",
    "address": "Av Bolívar frente al Multicentro",
    "lat": null,
    "lng": null,
    "city": "Valencia",
    "receives": "Centro de acopio",
    "contact": "https://www.instagram.com/p/DaAB8S-CAiB/?igsh=Njl4YXk4N3drM2tm"
  },
  {
    "who": "Comando Con Venezuela",
    "address": "Avenida Monseñor Adams, El Viñedo. Edificio Talislandia, mezzanina.",
    "lat": null,
    "lng": null,
    "city": "Valencia",
    "receives": "Agua, alimentos no perecederos, insumos médicos, ropa y abrigos.",
    "contact": "https://www.instagram.com/p/DZ_kBlyIVRI/?hl=es"
  },
  {
    "who": "Sociedad civil",
    "address": "Av. Principal la floresta, sector Santa Elena, Casa G-11 (Casa Prada",
    "lat": null,
    "lng": null,
    "city": "Valera",
    "receives": "Insumos médicos, alimentos no perecederos, ropa en buen estado",
    "contact": "Edgar Prada (04247137359)"
  },
  {
    "who": "Cáritas Venezuela",
    "address": "Sector centro, calle Páez entre Brasil y Perú, frente a la primera casa de Punto Fijo",
    "lat": null,
    "lng": null,
    "city": "Punto Fijo",
    "receives": "Agua potable, pañales adultos y niños, productos de higiene personal, alimentos no pereceeros, medicamentos esenciales",
    "contact": ""
  },
  {
    "who": "COLEGIO CRISTO REY ALTAMIRA",
    "address": "Colegio Cristo Rey Altamira. 7ma Avenida, entre 6ta y 7ma Transversal. https://maps.app.goo.gl/WwtukMpkrjwn1tP2A?g_st=ic",
    "lat": null,
    "lng": null,
    "city": "Caracas",
    "receives": "Enlatados, frutos secos, harina pan, queso, jamón, pan, primeros auxilios, herramientas y protección (cinceles, mandarrias, guantes para escombros, gatos de botella, piquetas, cascos de seguridad palas)",
    "contact": ""
  },
  {
    "who": "UCAB Guayana",
    "address": "Planta alta casa del estudiante Dirección de Desarrollo Estudiantil UCAB Guayana",
    "lat": null,
    "lng": null,
    "city": "Puerto Ordaz",
    "receives": "Cajas, bolsas negras, botellas vacías de cinco litros, alimentos no perecederos, agua potable, gasas, insumos médicos, cascos, guantes de ferretería, artículos de higiene personal, calzado y ropa en buen estado",
    "contact": "4249147305"
  },
  {
    "who": "Teatro de la Ópera",
    "address": "Teatro de la Ópera",
    "lat": null,
    "lng": null,
    "city": "Maracay",
    "receives": "Agua potable y alimentos no perecederos, medicamentos e insumos de primeros auxilios, productos de higiene personal y pañales, ropa y cobijas en buen estado",
    "contact": ""
  },
  {
    "who": "Fe y Alegría",
    "address": "Fe y Alegría \"Padre Felipe Salvador Gilij\" https://www.google.com/maps/place/JR33%2BWP3+Fe+y+Alegr%C3%ADa+Padre+Felipe+Salvador+Gilij,+C.+Merida,+Barinas+5201,+Barinas,+Venezuela/@8.6050837,-70.1957809,892m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e7b59a8fff4fa7d:0x7f942c3810c516a3!8m2!3d8.6050614!4d-70.1956269!16s%2Fg%2F11bvtd3g16!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYyMi4wIKXMDSoASAFQAw%3D%3D",
    "lat": null,
    "lng": null,
    "city": "Barinas",
    "receives": "",
    "contact": ""
  },
  {
    "who": "RELEVECA",
    "address": "Ciudad Ojeda, centro comercial Reycall, frente a la E/S La Tropicana",
    "lat": null,
    "lng": null,
    "city": "Ciudad Ojeda, Estado Zulia",
    "receives": "Artículos de higiene personal, ropa, alimentos no perecederos, alimento para mascotas, insumos médico",
    "contact": "04122581233 - 04246302640 - https://instagram.com/releveca_ca/"
  },
  {
    "who": "Colegio de Médicos",
    "address": "Sede del Colegio de Médicos",
    "lat": null,
    "lng": null,
    "city": "Maracaibo",
    "receives": "Material Médico y primeros auxilios y medicamentos esenciales",
    "contact": "https://www.instagram.com/comezu_2021"
  },
  {
    "who": "Expresos Occidente",
    "address": "Principales sedes",
    "lat": null,
    "lng": null,
    "city": "",
    "receives": "Alimentos no perecederos, agua potable embotellada, artículos de higiene, insumos médicos, ropa limpia y en buen estado",
    "contact": ""
  },
  {
    "who": "Gobierno de Venezuela",
    "address": "Carretera H, frente al Hotel Costa Sol (antiguo El Remanso)",
    "lat": null,
    "lng": null,
    "city": "Cabimas",
    "receives": "Alimentos no perecederos, productos de higiene personal, insumos médicos básicos, productos de limpieza, ropa y calzado en buen estado, agua potable envasada",
    "contact": ""
  },
  {
    "who": "Gobierno de Venezuela",
    "address": "Avenida 32 con Carretera H, frente a las oficinas de Corpoelec",
    "lat": null,
    "lng": null,
    "city": "Cabimas",
    "receives": "Alimentos no perecederos, productos de higiene personal, insumos médicos básicos, productos de limpieza, ropa y calzado en buen estado, agua potable envasada",
    "contact": ""
  },
  {
    "who": "Gobierno de Venezuela",
    "address": "Carretera H, Centro Comercial Borjas, estación radial Xtrema 98.9FM",
    "lat": null,
    "lng": null,
    "city": "Cabimas",
    "receives": "Alimentos no perecederos, productos de higiene personal, insumos médicos básicos, productos de limpieza, ropa y calzado en buen estado, agua potable envasada",
    "contact": ""
  },
  {
    "who": "Sociedad civil",
    "address": "CC Santa Eulalia, urb Boyacá, exq Brill",
    "lat": null,
    "lng": null,
    "city": "Anzoategui",
    "receives": "Alimentos no perecederos, ropa en buenas condiciones, medicamentos de primera necesidad, artículos de higiene",
    "contact": "Brill Panadería https://www.instagram.com/stories/exqbrill/3927402934296267999/?hl=es"
  },
  {
    "who": "Caritas de Venezuela",
    "address": "Parroquia Santo Domingo de Guzmán, las Cocuizas.",
    "lat": null,
    "lng": null,
    "city": "Monagas",
    "receives": "Alimentos no perecederos, agua potable, pañales para adultos y niños",
    "contact": ""
  },
  {
    "who": "Caritas de Venezuela",
    "address": "Catedral nuestra Sra del Carmen.",
    "lat": null,
    "lng": null,
    "city": "Monagas",
    "receives": "Alimentos no perecederos, agua potable, pañales para adultos y niños",
    "contact": ""
  }
];
