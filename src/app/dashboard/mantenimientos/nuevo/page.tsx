"use client";

import React, { useState, useEffect, useMemo } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";


async function uploadToCloudinary(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Falta configurar Cloudinary");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "mantenimientos_temp");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Error subiendo imagen");
  }

  return await res.json();
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1979 }, (_, i) => 1980 + i).reverse();
const STORAGE_KEY = "as_gruas_nuevo_mantenimiento_borrador_v4";

const TIPOS_UNIDAD = [
  "Automóvil", "Pickup", "SUV", "Van / Pasajeros", "Camioneta de Carga",
  "Rabón", "Torton", "Tracto", "Plataforma", "Grúa Arrastre",
  "Grúa Plataforma", "Grúa Hidráulica", "Quinta Rueda", "Equipo Pesado",
];

const MARCAS: Record<string, string[]> = {
  Nissan: ["March", "Versa", "Sentra", "Altima", "Kicks", "X-Trail", "Pathfinder", "Rogue", "Frontier", "NP300", "Navara", "Urvan", "NV350", "Otro"],
  Chevrolet: ["Aveo", "Spark", "Onix", "Beat", "Cavalier", "Malibu", "Tracker", "Captiva", "Equinox", "Blazer", "S10", "Colorado", "Silverado 1500", "Silverado 2500", "Silverado 3500", "Suburban", "Tahoe", "Express", "Otro"],
  Toyota: ["Yaris", "Corolla", "Camry", "RAV4", "Highlander", "4Runner", "Land Cruiser", "Prado", "Hilux", "Tacoma", "Tundra", "Hiace", "Avanza", "Otro"],
  Honda: ["City", "Fit", "Civic", "Accord", "CR-V", "HR-V", "BR-V", "Pilot", "Odyssey", "Ridgeline", "Otro"],
  Mazda: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-50", "CX-9", "BT-50", "Otro"],
  Volkswagen: ["Jetta", "Vento", "Polo", "Golf", "Tiguan", "Taos", "Teramont", "Saveiro", "Amarok", "Caddy", "Transporter", "Pointer", "Otro"],
  Hyundai: ["Grand i10", "i10", "Accent", "Elantra", "Sonata", "Creta", "Tucson", "Santa Fe", "Palisade", "H-1 / Starex", "Otro"],
  Kia: ["Rio", "Forte", "K3", "K5", "Soul", "Seltos", "Sportage", "Sorento", "Telluride", "Carnival", "Otro"],
  Ford: ["Fiesta", "Focus", "Fusion", "Mustang", "Escape", "Edge", "Explorer", "Expedition", "Ranger", "F-150", "F-250", "F-350", "F-450", "F-550", "Transit", "E-Series", "Otro"],
  Ram: ["700", "1200", "1500", "2500", "3500", "4000 Chasis Cabina", "4000 Redilas", "4000 Caja Seca", "4000 Plataforma", "4000 Grúa / Pluma", "ProMaster", "Otro"],
  Dodge: ["Attitude", "Neon", "Charger", "Challenger", "Durango", "Journey", "Otro"],
  Jeep: ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator", "Otro"],
  Mitsubishi: ["L200", "Outlander", "Montero", "Eclipse Cross", "ASX", "Otro"],
  Suzuki: ["Swift", "Ignis", "Baleno", "Ciaz", "Jimny", "Vitara", "S-Cross", "Ertiga", "Otro"],
  Renault: ["Kwid", "Sandero", "Stepway", "Duster", "Kangoo", "Oroch", "Otro"],
  Peugeot: ["206", "207", "208", "2008", "3008", "Partner", "Expert", "Boxer", "Otro"],
  MG: ["MG3", "MG5", "ZS", "HS", "RX5", "MG GT", "Otro"],
  SEAT: ["Ibiza", "León", "Arona", "Ateca", "Tarraco", "Toledo", "Otro"],
  Isuzu: ["ELF 300", "ELF 400", "ELF 500", "ELF 600", "NPR", "NQR", "Otro"],
  Hino: ["Serie 300", "Serie 500", "Serie 700", "Otro"],
  "Mercedes-Benz": ["Sprinter", "Vito", "A-Class", "C-Class", "GLA", "GLC", "Otro"],
  International: ["Durastar", "MV", "CV", "LT", "RH", "HX", "ProStar", "WorkStar", "TranStar", "Otro"],
  Kenworth: ["T680", "T880", "W900", "T800", "T370", "T270", "Otro"],
  Freightliner: ["Cascadia", "Century", "Columbia", "M2 106", "114SD", "Coronado", "Otro"],
  Peterbilt: ["579", "389", "567", "365", "337", "Otro"],
  Volvo: ["VNL", "VNR", "VNX", "Otro"],
  Mack: ["Anthem", "Granite", "Pinnacle", "Otro"],
  Scania: ["P-Series", "G-Series", "R-Series", "S-Series", "Otro"],
  Otro: ["Otro"],
};

const REFACCIONES_MECANICO = [
  "Batería", "Alternador", "Marcha", "Bujías", "Bobinas",
  "Filtro de aceite", "Filtro de aire", "Filtro de gasolina", "Filtro de cabina",
  "Aceite de motor", "Anticongelante", "Líquido de frenos", "Aceite transmisión", "Aceite diferencial",
  "Balatas delanteras", "Balatas traseras", "Discos de freno", "Tambores", "Calipers",
  "Clutch", "Kit de clutch", "Bomba clutch", "Volante motor",
  "Bomba de gasolina", "Bomba de agua", "Radiador", "Mangueras", "Termostato",
  "Banda de accesorios", "Banda de distribución", "Tensor", "Poleas",
  "Amortiguadores", "Muelles", "Rótulas", "Terminales de dirección", "Cremallera",
  "Inyectores", "Turbina", "Intercooler", "Sensor MAF", "Sensor CKP", "Sensor CMP", "ECU",
  "Compresor A/C", "Condensador A/C", "Evaporador A/C",
  "Motor", "Transmisión", "Diferencial", "Cardán", "Retenes", "Empaques",
  "Llantas", "Fusibles", "Arnés", "Faros/Calaveras", "Otro",
];

const REFACCIONES_HIDRAULICO = [
  "Manguera hidráulica alta presión", "Manguera hidráulica baja presión",
  "Conexión / fitting hidráulico", "Adaptador hidráulico",
  "Bomba hidráulica", "Motor hidráulico",
  "Cilindro hidráulico", "Sello / empaque cilindro",
  "Válvula de control direccional", "Válvula de alivio", "Válvula check",
  "Filtro hidráulico", "Aceite hidráulico",
  "Depósito / tanque hidráulico", "Enfriador de aceite hidráulico",
  "Manómetro hidráulico", "Sensor de presión hidráulica",
  "Acumulador hidráulico", "Bloque de válvulas",
  "Pluma / brazo hidráulico", "Gancho / ancla", "Otro",
];

const REFACCIONES_ELECTRICO = [
  "Batería principal", "Batería auxiliar",
  "Alternador", "Regulador de voltaje",
  "Fusible / caja de fusibles", "Relay / relevador",
  "Arnés eléctrico", "Cable de poder",
  "Sensor de temperatura", "Sensor de oxígeno", "Sensor ABS",
  "ECU / módulo de control", "Módulo BCM",
  "Motor de arranque / marcha", "Solenoide de arranque",
  "Faros delanteros", "Calaveras traseras", "Luces de trabajo",
  "Interruptor / switch", "Tablero / instrumentos",
  "Bocina", "Alarma de reversa", "Cargador / convertidor", "Inversor", "Otro",
];

function generarFolio() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `MANT-${y}${m}${d}-${hh}${mm}${ss}`;
}

const FORM_INICIAL = {
  folio: "",
  tipoUnidad: "",
  area: "Mecánico",
  placas: "",
  operador: "",
  numeroEconomico: "",
  marca: "",
  submarca: "",
  submarcaLibre: "",
  anio: "",
  fechaMantenimiento: "",
  falla: "",
  mantenimiento: "",
  proveedor: "",
  garantia: "",
  combustibleTipo: "Diésel",
  combustibleMontoDepositado: "",
  combustibleMontoGastado: "",
  combustibleCambio: 0,
  combustibleTenia: "",
  combustibleQueda: "",
  recorridos: "",
};

const toNumber = (v: any) => {
  const n = Number(String(v ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const moneyMXN = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

function safeText(v: any) {
  return (v ?? "").toString().trim();
}

function escapeHtml(text: any) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function nl2brSafe(text: any) {
  return escapeHtml(text).replace(/\n/g, "<br/>");
}

function sanitizeFilePart(text: string) {
  return String(text || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");
}

function downloadBlob(filename: string, mime: string, content: string | BlobPart) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function pickImageAsDataUrl(file: File, cb: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => cb(String(reader.result || ""));
  reader.readAsDataURL(file);
}

function getRefaccionesPorArea(area: string) {
  if (area === "Hidráulico") return REFACCIONES_HIDRAULICO;
  if (area === "Eléctrico") return REFACCIONES_ELECTRICO;
  return REFACCIONES_MECANICO;
}

export default function NuevoMantenimiento() {
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [refaccionesSeleccionadas, setRefaccionesSeleccionadas] = useState<string[]>([]);
  const [refaccionOtro, setRefaccionOtro] = useState("");
  const [fotoTenia, setFotoTenia] = useState<string>("");
  const [fotoQueda, setFotoQueda] = useState<string>("");
  const [guardado, setGuardado] = useState(false);
  const [docIdGuardado, setDocIdGuardado] = useState<string>("");
  const [cargadoStorage, setCargadoStorage] = useState(false);
  const [loadingGuardar, setLoadingGuardar] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingWord, setLoadingWord] = useState(false);
  const [loadingWhats, setLoadingWhats] = useState(false);

  const refaccionesLista = getRefaccionesPorArea(form.area);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.form) setForm(parsed.form);
        if (Array.isArray(parsed?.refaccionesSeleccionadas)) setRefaccionesSeleccionadas(parsed.refaccionesSeleccionadas);
        if (typeof parsed?.refaccionOtro === "string") setRefaccionOtro(parsed.refaccionOtro);
        if (typeof parsed?.fotoTenia === "string") setFotoTenia(parsed.fotoTenia);
        if (typeof parsed?.fotoQueda === "string") setFotoQueda(parsed.fotoQueda);
        if (typeof parsed?.guardado === "boolean") setGuardado(parsed.guardado);
        if (typeof parsed?.docIdGuardado === "string") setDocIdGuardado(parsed.docIdGuardado);
      }
    } catch (error) {
      console.error("No se pudo cargar borrador:", error);
    } finally {
      setCargadoStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!cargadoStorage) return;
    setForm((prev) => {
      if (prev.folio) return prev;
      return { ...prev, folio: generarFolio() };
    });
  }, [cargadoStorage]);

  useEffect(() => {
    if (!cargadoStorage) return;

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          form,
          refaccionesSeleccionadas,
          refaccionOtro,
          fotoTenia,
          fotoQueda,
          guardado,
          docIdGuardado,
        })
      );
    } catch (error) {
      console.error("No se pudo guardar borrador en sessionStorage:", error);
    }
  }, [form, refaccionesSeleccionadas, refaccionOtro, fotoTenia, fotoQueda, guardado, docIdGuardado, cargadoStorage]);

  const iniciarDictado = (field: "mantenimiento" | "recorridos" | "falla") => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Tu navegador no soporta dictado por voz (usa Chrome en Android / Edge en PC).");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "es-MX";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();

    recognition.onresult = (event: any) => {
      const texto = event.results[0][0].transcript;
      setForm((prev) => ({
        ...prev,
        [field]: (prev as any)[field] ? (prev as any)[field] + " " + texto : texto,
      }));
    };

    recognition.onerror = () => {
      alert("No se pudo iniciar el dictado. Revisa permisos del micrófono.");
    };
  };

  const handleMarcaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      marca: value,
      submarca: "",
      submarcaLibre: "",
    }));
  };

  const handleSubmarcaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      submarca: value,
      submarcaLibre: value === "Otro" ? prev.submarcaLibre : "",
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "area") {
        setRefaccionesSeleccionadas([]);
        setRefaccionOtro("");
      }

      if (name === "combustibleMontoDepositado" || name === "combustibleMontoGastado") {
        const dep = toNumber(
          name === "combustibleMontoDepositado" ? value : prev.combustibleMontoDepositado
        );
        const gas = toNumber(
          name === "combustibleMontoGastado" ? value : prev.combustibleMontoGastado
        );
        next.combustibleCambio = Math.max(0, dep - gas);
      }

      return next;
    });
  };

  const refaccionesFinal = useMemo(() => {
    return refaccionesSeleccionadas.includes("Otro")
      ? [...refaccionesSeleccionadas.filter((r) => r !== "Otro"), refaccionOtro.trim()].filter(Boolean)
      : refaccionesSeleccionadas;
  }, [refaccionesSeleccionadas, refaccionOtro]);

  const resumenKPI = useMemo(() => {
    const dep = toNumber(form.combustibleMontoDepositado);
    const gas = toNumber(form.combustibleMontoGastado);
    const cam = Math.max(0, dep - gas);
    return { dep, gas, cam, countRef: refaccionesFinal.length };
  }, [form.combustibleMontoDepositado, form.combustibleMontoGastado, refaccionesFinal]);

  const buildReportObject = () => {
    const submarcaFinal =
      form.submarca === "Otro" ? safeText(form.submarcaLibre) : safeText(form.submarca);

    return {
      folio: safeText(form.folio),
      fecha: safeText(form.fechaMantenimiento) || "(sin fecha)",
      placas: safeText(form.placas),
      operador: safeText(form.operador),
      numeroEconomico: safeText(form.numeroEconomico),
      tipoUnidad: safeText(form.tipoUnidad),
      area: safeText(form.area),
      marca: safeText(form.marca),
      submarcaFinal,
      anio: safeText(form.anio),
      falla: safeText(form.falla),
      mantenimiento: safeText(form.mantenimiento),
      proveedor: safeText(form.proveedor),
      garantia: safeText(form.garantia),
      combustibleTipo: safeText(form.combustibleTipo),
      combustibleMontoDepositado: toNumber(form.combustibleMontoDepositado),
      combustibleMontoGastado: toNumber(form.combustibleMontoGastado),
      combustibleCambio: Math.max(
        0,
        toNumber(form.combustibleMontoDepositado) - toNumber(form.combustibleMontoGastado)
      ),
      combustibleTenia: safeText(form.combustibleTenia),
      combustibleQueda: safeText(form.combustibleQueda),
      refacciones: refaccionesFinal,
      recorridos: safeText(form.recorridos),
    };
  };

  const validar = () => {
    const submarcaFinal =
      form.submarca === "Otro" ? safeText(form.submarcaLibre) : safeText(form.submarca);

    if (!form.fechaMantenimiento) {
      alert("Falta Fecha de mantenimiento");
      return false;
    }

    if (!form.tipoUnidad) {
      alert("Falta Tipo de unidad");
      return false;
    }

    if (!safeText(form.placas)) {
      alert("Faltan placas");
      return false;
    }

    if (!safeText(form.marca)) {
      alert("Falta marca");
      return false;
    }

    if (!submarcaFinal) {
      alert("Falta submarca/modelo");
      return false;
    }

    return true;
  };

  const guardarEnFirestore = async () => {
    if (guardado && docIdGuardado) return docIdGuardado;

    const submarcaFinal =
      form.submarca === "Otro" ? safeText(form.submarcaLibre) : safeText(form.submarca);

    const dep = toNumber(form.combustibleMontoDepositado);
    const gas = toNumber(form.combustibleMontoGastado);

    const payload = {
      ...form,
      submarcaFinal,
      refaccionesFinal,
      combustibleMontoDepositadoNum: dep,
      combustibleMontoGastadoNum: gas,
      combustibleCambioNum: Math.max(0, dep - gas),
      tieneFotoCombustibleTenia: !!fotoTenia,
      tieneFotoCombustibleQueda: !!fotoQueda,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "mantenimientos"), payload);

    setGuardado(true);
    setDocIdGuardado(docRef.id);

    return docRef.id;
  };

  const nuevoServicio = () => {
    if (!confirm("¿Iniciar un servicio nuevo? Se borrará toda la información del formulario.")) return;

    const nuevo = { ...FORM_INICIAL, folio: generarFolio() };

    setForm(nuevo);
    setRefaccionesSeleccionadas([]);
    setRefaccionOtro("");
    setFotoTenia("");
    setFotoQueda("");
    setGuardado(false);
    setDocIdGuardado("");

    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const descargarExcelCSV = async () => {
    try {
      setLoadingExcel(true);

      if (!validar()) return;

      console.log("Excel sin guardar Firebase");

       const r = buildReportObject();

      const headers = [
        "Folio",
        "FechaMantenimiento",
        "Placas",
        "Operador",
        "NumeroEconomico",
        "TipoUnidad",
        "Area",
        "Marca",
        "Submarca",
        "Anio",
        "Falla",
        "MantenimientoRealizado",
        "Proveedor",
        "Garantia",
        "CombustibleTipo",
        "MontoDepositadoMXN",
        "MontoGastadoMXN",
        "CambioMXN",
        "Tenia",
        "Queda",
        "Refacciones",
        "Recorridos",
      ];

      const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}";`

      const row = [
        r.folio,
        r.fecha,
        r.placas,
        r.operador,
        r.numeroEconomico,
        r.tipoUnidad,
        r.area,
        r.marca,
        r.submarcaFinal,
        r.anio,
        r.falla,
        r.mantenimiento,
        r.proveedor,
        r.garantia,
        r.combustibleTipo,
        r.combustibleMontoDepositado,
        r.combustibleMontoGastado,
        r.combustibleCambio,
        r.combustibleTenia,
        r.combustibleQueda,
        r.refacciones.join(" | "),
        r.recorridos,
      ].map(esc);

      const csv = "\uFEFF" + [headers.join(","), row.join(",")].join("\n");
      const placasSafe = sanitizeFilePart(r.placas || "sin_placas");
      const fn = `reporte_${sanitizeFilePart(r.folio)}_${placasSafe}_${new Date().toISOString().slice(0, 10)}.csv`;

      downloadBlob(fn, "text/csv;charset=utf-8;", csv);
      alert(`✅ Excel generado.\nFolio: ${r.folio}`);
    } catch (error: any) {
      console.error("Error al exportar Excel:", error);
      alert("❌ No se pudo generar Excel.\n" + (error?.message || "Error desconocido"));
    } finally {
      setLoadingExcel(false);
    }
  };

  const descargarWord = async () => {
    try {
      setLoadingWord(true);

      if (!validar()) {
        alert("Faltan datos obligatorios para generar el reporte");
        return;
      }

      console.log("Word sin guardar Firebase");


      const r = buildReportObject();
      const dep = moneyMXN(r.combustibleMontoDepositado);
      const gas = moneyMXN(r.combustibleMontoGastado);
      const cam = moneyMXN(r.combustibleCambio);

      const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Reporte</title>
<style>
body{font-family:Arial,sans-serif;margin:24px;color:#0b1220}
.h1{font-size:20px;font-weight:900;margin:0}
.sub{font-size:12px;color:#334155;margin:4px 0 0}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0 18px}
.card{border:1px solid #cbd5e1;border-radius:12px;padding:10px}
.k{font-size:11px;color:#475569;font-weight:700;text-transform:uppercase}
.v{font-size:16px;font-weight:900;margin-top:6px}
table{width:100%;border-collapse:collapse;margin-top:10px}
td{border:1px solid #cbd5e1;padding:8px;vertical-align:top;font-size:12px}
.small{font-size:11px;color:#475569}
.img-wrap{margin-top:16px}
.img-title{font-size:13px;font-weight:700;margin:0 0 8px}
.img-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.img-box{border:1px solid #cbd5e1;border-radius:12px;padding:8px}
.img-box p{margin:0 0 6px;font-size:11px;color:#475569;font-weight:700}
.img-box img{width:180px;height:140px;object-fit:cover;border-radius:8px;}
</style>
</head>
<body>


  <p class="h1">Reporte de Mantenimiento &amp; Combustible — AS GRÚAS</p>
  <p class="sub">${escapeHtml(new Date().toLocaleString("es-MX"))} • Área: ${escapeHtml(r.area)} • Tipo: ${escapeHtml(r.tipoUnidad)}</p>

  <div class="cards">
    <div class="card"><div class="k">Folio</div><div class="v">${escapeHtml(r.folio)}</div></div>
    <div class="card"><div class="k">Depositado</div><div class="v">${escapeHtml(dep)}</div></div>
    <div class="card"><div class="k">Gastado</div><div class="v">${escapeHtml(gas)}</div></div>
  </div>

  <table>
    <tr><td><b>Folio</b></td><td>${escapeHtml(r.folio)}</td></tr>
    <tr><td><b>Fecha</b></td><td>${escapeHtml(r.fecha)}</td></tr>
    <tr><td><b>Placas</b></td><td>${escapeHtml(r.placas)}</td></tr>
    <tr><td><b>Operador</b></td><td>${escapeHtml(r.operador)}</td></tr>
    <tr><td><b>Núm. económico</b></td><td>${escapeHtml(r.numeroEconomico)}</td></tr>
    <tr><td><b>Unidad</b></td><td>${escapeHtml(`${r.marca} ${r.submarcaFinal} (${r.anio})`)}</td></tr>
    <tr><td><b>Tipo</b></td><td>${escapeHtml(r.tipoUnidad)}</td></tr>
    <tr><td><b>Área</b></td><td>${escapeHtml(r.area)}</td></tr>
    <tr><td><b>Proveedor</b></td><td>${escapeHtml(r.proveedor || "-")}</td></tr>
    <tr><td><b>Garantía</b></td><td>${escapeHtml(r.garantia || "-")}</td></tr>
    <tr><td><b>Combustible</b></td><td>${escapeHtml(r.combustibleTipo)}</td></tr>
    <tr><td><b>Depositado</b></td><td>${escapeHtml(dep)}</td></tr>
    <tr><td><b>Gastado</b></td><td>${escapeHtml(gas)}</td></tr>
    <tr><td><b>Cambio</b></td><td>${escapeHtml(cam)}</td></tr>
    <tr><td><b>Tenía</b></td><td>${escapeHtml(r.combustibleTenia || "-")}</td></tr>
    <tr><td><b>Queda</b></td><td>${escapeHtml(r.combustibleQueda || "-")}</td></tr>
    <tr><td><b>Falla</b></td><td>${nl2brSafe(r.falla || "-")}</td></tr>
    <tr><td><b>Mantenimiento</b></td><td>${nl2brSafe(r.mantenimiento || "-")}</td></tr>
    <tr><td><b>Refacciones</b></td><td>${escapeHtml(r.refacciones.join(", ") || "-")}</td></tr>
    <tr><td><b>Recorridos</b></td><td>${nl2brSafe(r.recorridos || "-")}</td></tr>
  </table>

  ${(fotoTenia || fotoQueda) ? `
  <div class="img-wrap">
    <p class="img-title">Evidencia fotográfica</p>
    <div class="img-grid">
      ${fotoTenia ? `
      <div class="img-box">
        <p>Foto “Tenía”</p>
        <img src="${fotoTenia}" alt="Foto tenía" />
      </div>` : ""}
      ${fotoQueda ? `
      <div class="img-box">
        <p>Foto “Queda”</p>
        <img src="${fotoQueda}" alt="Foto queda" />
      </div>` : ""}
    </div>
  </div>` : ""}

  <p class="small" style="margin-top:14px">Generado desde el panel administrativo AS GRÚAS.</p>
</body>
</html>`
;

      const placasSafe = sanitizeFilePart(r.placas || "sin_placas");
      const fn = `reporte_${sanitizeFilePart(r.folio)}_${placasSafe}_${new Date().toISOString().slice(0, 10)}.doc`;

downloadBlob(fn, "application/msword;charset=utf-8;", "\ufeff" + html);
      alert(`✅ Word generado.\nFolio: ${r.folio}`);
    } catch (error: any) {
      console.error("Error al exportar Word:", error);
      alert("❌ No se pudo generar Word.\n" + (error?.message || "Error desconocido"));
    } finally {
      setLoadingWord(false);
    }
  };

  const compartirWhatsAppResumen = async () => {
    try {
      setLoadingWhats(true);

      if (!validar()) {
        alert("Faltan datos obligatorios para generar el reporte");
        return;
      }

      console.log("WhatsApp sin guardar Firebase");
      
      const r = buildReportObject();

      const msg =
        `🧾 *Reporte de mantenimiento AS GRÚAS*\n\n` +
        `🆔 *Folio:* ${r.folio}\n` +
        `📅 *Fecha:* ${r.fecha}\n` +
        `🚘 *Placas:* ${r.placas || "-"}\n` +
        `👤 *Operador:* ${r.operador || "-"}\n` +
        `🔢 *Número económico:* ${r.numeroEconomico || "-"}\n` +
        `🏷️ *Unidad:* ${r.marca} ${r.submarcaFinal} (${r.anio || "-"})\n` +
        `🛠️ *Área:* ${r.area}\n` +
        `🚚 *Tipo de unidad:* ${r.tipoUnidad}\n` +
        `🏪 *Proveedor:* ${r.proveedor || "-"}\n` +
        `🛡️ *Garantía:* ${r.garantia || "-"}\n\n` +
        `⛽ *Combustible:* ${r.combustibleTipo}\n` +
        `💰 *Depositado:* ${moneyMXN(r.combustibleMontoDepositado)}\n` +
        `🧾 *Gastado:* ${moneyMXN(r.combustibleMontoGastado)}\n` +
        `🟢 *Cambio:* ${moneyMXN(r.combustibleCambio)}\n` +
        `📍 *Tenía:* ${r.combustibleTenia || "-"}\n` +
        `📍 *Queda:* ${r.combustibleQueda || "-"}\n\n` +
        `🔧 *Refacciones:* ${r.refacciones.join(", ") || "-"}\n\n` +
        `📝 *Falla:* ${r.falla || "-"}\n\n` +
        `✅ *Mantenimiento:* ${r.mantenimiento || "-"}\n\n` +
        `📌 *Recorridos:* ${r.recorridos || "-"}\n;`

      const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.location.href = waUrl;
    } catch (error: any) {
      console.error("Error al compartir por WhatsApp:", error);
      alert("❌ No se pudo abrir WhatsApp.\n" + (error?.message || "Error desconocido"));
    } finally {
      setLoadingWhats(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoadingGuardar(true);

      if (!validar()) return;

      const id = await guardarEnFirestore();

      alert(
        `✅ Registro guardado.\nFolio: ${form.folio}\nID: ${id}\n\nPuedes seguir descargando Word/Excel o enviando por WhatsApp.\nCuando termines, pulsa "Servicio Nuevo".`
      );
    } catch (error: any) {
      console.error("Error al guardar:", error);
      alert(
        "❌ No se pudo guardar en Firebase.\n" +
        (error?.message || "Error desconocido") +
        "\n\nLo más probable es que Firestore esté rechazando el documento o las reglas no permitan escribir."
      );
    } finally {
      setLoadingGuardar(false);
    }
  };

  const maxVal = Math.max(1, resumenKPI.dep, resumenKPI.gas, resumenKPI.cam);
  const barW = (v: number) => Math.round((v / maxVal) * 100);

  return (
    <div style={wrapper}>
      <div style={topBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={logoDot} />
          <div>
            <div style={brand}>AS GRÚAS</div>
            <div style={brandSub}>Módulo de Mantenimientos • Reporte profesional</div>
          </div>
        </div>

        <div style={chipRow}>
          <span style={{ ...chip, background: "linear-gradient(90deg,#0ea5e9,#2563eb)" }}>
            {form.folio || "Folio"}
          </span>
          <span style={{ ...chip, background: "linear-gradient(90deg,#ef4444,#f97316)" }}>
            {form.area || "Área"}
          </span>
          <span style={{ ...chip, background: "linear-gradient(90deg,#22c55e,#06b6d4)" }}>
            {form.tipoUnidad || "Tipo"}
          </span>
          <span style={{ ...chip, background: "linear-gradient(90deg,#8b5cf6,#ec4899)" }}>
            {form.combustibleTipo || "Combustible"}
          </span>
          {guardado && (
            <span style={{ ...chip, background: "linear-gradient(90deg,#16a34a,#22c55e)" }}>
              ✅ Guardado
            </span>
          )}
        </div>
      </div>

      <div style={card}>
        <div style={headerRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 style={title}>Nuevo Registro</h1>
            <button type="button" onClick={nuevoServicio} style={btnNuevo}>
              🆕 Servicio Nuevo
            </button>
          </div>

          <div style={headerBtns}>
            <button
              type="button"
              onClick={descargarExcelCSV}
              disabled={loadingExcel}
              style={{ ...btnGhost, opacity: loadingExcel ? 0.7 : 1 }}
            >
              {loadingExcel ? "Generando..." : "⬇️ Excel (CSV)"}
            </button>

            <button
              type="button"
              onClick={descargarWord}
              disabled={loadingWord}
              style={{ ...btnGhost2, opacity: loadingWord ? 0.7 : 1 }}
            >
              {loadingWord ? "Generando..." : "⬇️ Word"}
            </button>

            <button
              type="button"
              onClick={compartirWhatsAppResumen}
              disabled={loadingWhats}
              style={{ ...btnWhats, opacity: loadingWhats ? 0.7 : 1 }}
            >
              {loadingWhats ? "Abriendo..." : "WhatsApp"}
            </button>
          </div>
        </div>

        <div style={kpiWrap}>
          <div style={kpiCard}>
            <div style={kLabel}>Depositado</div>
            <div style={kValue}>{moneyMXN(resumenKPI.dep)}</div>
          </div>
          <div style={kpiCard}>
            <div style={kLabel}>Gastado</div>
            <div style={kValue}>{moneyMXN(resumenKPI.gas)}</div>
          </div>
          <div style={kpiCard}>
            <div style={kLabel}>Cambio</div>
            <div style={kValue}>{moneyMXN(resumenKPI.cam)}</div>
          </div>
          <div style={kpiCard}>
            <div style={kLabel}>Refacciones</div>
            <div style={kValue}>{resumenKPI.countRef}</div>
          </div>
        </div>

        <div style={chartCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style={chartTitle}>Gráfica rápida (MXN)</div>
            <div style={chartHint}>Se actualiza sola al escribir</div>
          </div>

          <div style={bars}>
            <div style={barRow}>
              <div style={barName}>Depositado</div>
              <div style={barTrack}>
                <div
                  style={{
                    ...barFill,
                    width: `${barW(resumenKPI.dep)}%`,
                    background: "linear-gradient(90deg,#22c55e,#06b6d4)",
                  }}
                />
              </div>
              <div style={barVal}>{moneyMXN(resumenKPI.dep)}</div>
            </div>

            <div style={barRow}>
              <div style={barName}>Gastado</div>
              <div style={barTrack}>
                <div
                  style={{
                    ...barFill,
                    width: `${barW(resumenKPI.gas)}%`,
                    background: "linear-gradient(90deg,#f97316,#ef4444)",
                  }}
                />
              </div>
              <div style={barVal}>{moneyMXN(resumenKPI.gas)}</div>
            </div>

            <div style={barRow}>
              <div style={barName}>Cambio</div>
              <div style={barTrack}>
                <div
                  style={{
                    ...barFill,
                    width: `${barW(resumenKPI.cam)}%`,
                    background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                  }}
                />
              </div>
              <div style={barVal}>{moneyMXN(resumenKPI.cam)}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18, marginTop: 16 }}>
          <div style={sectionTitleRow}>
            <div style={sectionTitle}>Datos generales</div>
            <div style={sectionBadge}>Obligatorio</div>
          </div>

          <div style={grid2}>
            <div>
              <div style={label}>Fecha de mantenimiento</div>
              <input
                type="date"
                name="fechaMantenimiento"
                value={form.fechaMantenimiento}
                onChange={handleChange}
                style={input}
              />
            </div>

            <div>
              <div style={label}>Área</div>
              <select name="area" value={form.area} onChange={handleChange} style={input}>
                <option value="Mecánico">Mecánico</option>
                <option value="Eléctrico">Eléctrico</option>
                <option value="Hidráulico">Hidráulico</option>
              </select>
            </div>

            <div>
              <div style={label}>Tipo de unidad</div>
              <select name="tipoUnidad" value={form.tipoUnidad} onChange={handleChange} style={input}>
                <option value="">Selecciona…</option>
                {TIPOS_UNIDAD.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={label}>Placas</div>
              <input
                name="placas"
                value={form.placas}
                placeholder="ABC-123"
                onChange={handleChange}
                style={input}
              />
            </div>

            <div>
              <div style={label}>Nombre operador</div>
              <input
                name="operador"
                value={form.operador}
                placeholder="Juan Pérez"
                onChange={handleChange}
                style={input}
              />
            </div>

            <div>
              <div style={label}>Número económico</div>
              <input
                name="numeroEconomico"
                value={form.numeroEconomico}
                placeholder="102"
                onChange={handleChange}
                style={input}
              />
            </div>

            <div>
              <div style={label}>Marca</div>
              <select name="marca" value={form.marca} onChange={handleMarcaChange} style={input}>
                <option value="">Selecciona…</option>
                {Object.keys(MARCAS).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={label}>Submarca / Modelo</div>
              <select
                name="submarca"
                value={form.submarca}
                onChange={handleSubmarcaChange}
                style={input}
                disabled={!form.marca}
              >
                <option value="">{form.marca ? "Selecciona…" : "Primero marca"}</option>
                {form.marca &&
                  (MARCAS[form.marca] || []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>

              {form.submarca === "Otro" && (
                <input
                  name="submarcaLibre"
                  value={form.submarcaLibre}
                  placeholder="Escribe el modelo exacto…"
                  onChange={handleChange}
                  style={{ ...input, marginTop: 10 }}
                />
              )}
            </div>

            <div>
              <div style={label}>Año</div>
              <select name="anio" value={form.anio} onChange={handleChange} style={input}>
                <option value="">Selecciona…</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={sectionTitleRow}>
            <div style={sectionTitle}>Falla y mantenimiento</div>
            <div style={sectionBadge2}>Con dictado</div>
          </div>

          <div>
            <div style={label}>Descripción de falla</div>
            <div style={{ position: "relative" }}>
              <textarea
                name="falla"
                value={form.falla}
                placeholder="Describe el problema, síntomas, diagnóstico inicial…"
                onChange={handleChange}
                style={textarea}
              />
              <button type="button" onClick={() => iniciarDictado("falla")} style={micBtn2} title="Dictar falla">
                🎤
              </button>
            </div>
          </div>

          <div>
            <div style={label}>Mantenimiento realizado</div>
            <div style={{ position: "relative" }}>
              <textarea
                name="mantenimiento"
                value={form.mantenimiento}
                placeholder="Qué se hizo, reparación, ajuste, cambio…"
                onChange={handleChange}
                style={textarea}
              />
              <button type="button" onClick={() => iniciarDictado("mantenimiento")} style={micBtn} title="Dictar mantenimiento">
                🎤 Dictar
              </button>
            </div>
          </div>

          <div style={sectionTitleRow}>
            <div style={sectionTitle}>
              Refacciones <span style={{ fontSize: 12, opacity: 0.7 }}>({form.area})</span>
            </div>
            <div style={sectionBadge3}>Checklist</div>
          </div>

          <div>
            <div style={refGrid}>
              {refaccionesLista.map((ref) => {
                const activo = refaccionesSeleccionadas.includes(ref);
                return (
                  <label
                    key={ref}
                    style={{
                      ...refItem,
                      borderColor: activo ? "#22c55e" : "rgba(148,163,184,0.22)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={() => {
                        if (activo) {
                          setRefaccionesSeleccionadas(refaccionesSeleccionadas.filter((r) => r !== ref));
                        } else {
                          setRefaccionesSeleccionadas([...refaccionesSeleccionadas, ref]);
                        }
                      }}
                    />
                    <span style={{ marginLeft: 8 }}>{ref}</span>
                  </label>
                );
              })}
            </div>

            {refaccionesSeleccionadas.includes("Otro") && (
              <textarea
                placeholder={`Especifica otras refacciones de ${form.area}…`}
                value={refaccionOtro}
                onChange={(e) => setRefaccionOtro(e.target.value)}
                style={{ ...textarea, marginTop: 10 }}
              />
            )}
          </div>

          <div style={grid2}>
            <div>
              <div style={label}>Proveedor</div>
              <input
                name="proveedor"
                value={form.proveedor}
                placeholder="Ej. AutoZone, Agencia, MercadoLibre…"
                onChange={handleChange}
                style={input}
              />
            </div>

            <div>
              <div style={label}>Garantía</div>
              <input
                name="garantia"
                value={form.garantia}
                placeholder="Meses o fecha (Ej. 6 meses / 12-12-2026)"
                onChange={handleChange}
                style={input}
              />
            </div>
          </div>

          <div style={sectionTitleRow}>
            <div style={sectionTitle}>Cargas de combustible</div>
            <div style={sectionBadgeFuel}>Gas / Gasolina / Diésel</div>
          </div>

          <div style={fuelCard}>
            <div style={grid2}>
              <div>
                <div style={label}>Tipo de combustible</div>
                <select name="combustibleTipo" value={form.combustibleTipo} onChange={handleChange} style={input}>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diésel">Diésel</option>
                  <option value="Gas LP">Gas LP</option>
                  <option value="Gas Natural">Gas Natural</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <div style={label}>Monto depositado (MXN)</div>
                <input
                  name="combustibleMontoDepositado"
                  value={form.combustibleMontoDepositado}
                  placeholder="Ej. 1500"
                  onChange={handleChange}
                  style={input}
                  inputMode="decimal"
                />
              </div>

              <div>
                <div style={label}>Monto gastado (MXN)</div>
                <input
                  name="combustibleMontoGastado"
                  value={form.combustibleMontoGastado}
                  placeholder="Ej. 1320"
                  onChange={handleChange}
                  style={input}
                  inputMode="decimal"
                />
              </div>

              <div>
                <div style={label}>Cambio (automático)</div>
                <input
                  value={moneyMXN(
                    Math.max(
                      0,
                      toNumber(form.combustibleMontoDepositado) - toNumber(form.combustibleMontoGastado)
                    )
                  )}
                  readOnly
                  style={{ ...input, border: "1px solid rgba(34,197,94,0.45)" }}
                />
              </div>

              <div>
                <div style={label}>Tenía (litros / % / $)</div>
                <input
                  name="combustibleTenia"
                  value={form.combustibleTenia}
                  placeholder="Ej. 1/4, 35%, 120L"
                  onChange={handleChange}
                  style={input}
                />
              </div>

              <div>
                <div style={label}>Queda (litros / % / $)</div>
                <input
                  name="combustibleQueda"
                  value={form.combustibleQueda}
                  placeholder="Ej. 3/4, 70%, 240L"
                  onChange={handleChange}
                  style={input}
                />
              </div>
            </div>

            <div style={photoRow}>
              <div style={photoBox}>
                <div style={label}>Foto "Tenía"</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    pickImageAsDataUrl(f, (data) => setFotoTenia(data));
                  }}
                  style={fileInput}
                />
                {fotoTenia ? (
                  <img src={fotoTenia} alt="tenia" style={photoImg} />
                ) : (
                  <div style={photoPlaceholder}>Sin foto</div>
                )}
              </div>

              <div style={photoBox}>
                <div style={label}>Foto "Queda"</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    pickImageAsDataUrl(f, (data) => setFotoQueda(data));
                  }}
                  style={fileInput}
                />
                {fotoQueda ? (
                  <img src={fotoQueda} alt="queda" style={photoImg} />
                ) : (
                  <div style={photoPlaceholder}>Sin foto</div>
                )}
              </div>
            </div>
          </div>

          <div style={sectionTitleRow}>
            <div style={sectionTitle}>Recorridos</div>
            <div style={sectionBadge2}>Con dictado</div>
          </div>

          <div>
            <div style={label}>Recorridos / rutas / notas de traslado</div>
            <div style={{ position: "relative" }}>
              <textarea
                name="recorridos"
                value={form.recorridos}
                placeholder="Ej: Salida base 08:10 → Servicio Naucalpan → Regreso 10:25…"
                onChange={handleChange}
                style={textarea}
              />
              <button type="button" onClick={() => iniciarDictado("recorridos")} style={micBtn} title="Dictar recorridos">
                🎤 Dictar
              </button>
            </div>
          </div>

          <div style={actionsRow}>
            <button
              type="submit"
              disabled={loadingGuardar}
              style={{ ...buttonPrimary, opacity: loadingGuardar ? 0.7 : 1 }}
            >
              {loadingGuardar ? "Guardando..." : "✅ Guardar Registro"}
            </button>

            <button
              type="button"
              onClick={descargarExcelCSV}
              disabled={loadingExcel}
              style={{ ...buttonSecondary, opacity: loadingExcel ? 0.7 : 1 }}
            >
              {loadingExcel ? "Generando..." : "⬇️ Excel (CSV)"}
            </button>

            <button
              type="button"
              onClick={descargarWord}
              disabled={loadingWord}
              style={{ ...buttonSecondary2, opacity: loadingWord ? 0.7 : 1 }}
            >
              {loadingWord ? "Generando..." : "⬇️ Word"}
            </button>

            <button
              type="button"
              onClick={compartirWhatsAppResumen}
              disabled={loadingWhats}
              style={{ ...buttonWhats2, opacity: loadingWhats ? 0.7 : 1 }}
            >
              {loadingWhats ? "Abriendo..." : "📲 WhatsApp"}
            </button>

            <button type="button" onClick={nuevoServicio} style={buttonNuevo}>
              🆕 Servicio Nuevo
            </button>
          </div>

          <div style={footerNote}>
            💡 Guardar, Excel, Word y WhatsApp <b>conservan</b> la información en pantalla. Pulsa <b>"Servicio Nuevo"</b> cuando quieras limpiar el formulario para el siguiente servicio.
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===================== ESTILOS ===================== */
const wrapper: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(1200px 700px at 20% 10%, rgba(29,78,216,0.45) 0%, rgba(11,18,32,1) 55%, rgba(5,7,15,1) 100%)",
  padding: 22,
};

const topBar: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto 18px auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 16px",
  borderRadius: 16,
  background: "rgba(15,23,42,0.55)",
  border: "1px solid rgba(148,163,184,0.18)",
  backdropFilter: "blur(10px)",
};

const logoDot: React.CSSProperties = {
  width: 14,
  height: 14,
  borderRadius: 999,
  background: "linear-gradient(180deg,#22c55e,#06b6d4)",
  boxShadow: "0 0 18px rgba(34,197,94,0.55)",
};

const brand: React.CSSProperties = {
  color: "#e2e8f0",
  fontWeight: 900,
  letterSpacing: 1,
  fontSize: 14,
};

const brandSub: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  marginTop: 2,
};

const chipRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const chip: React.CSSProperties = {
  color: "white",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
};

const card: React.CSSProperties = {
  maxWidth: 1200,
  margin: "auto",
  background: "rgba(30,41,59,0.75)",
  padding: 22,
  borderRadius: 20,
  border: "1px solid rgba(148,163,184,0.18)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
  color: "#e2e8f0",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const headerBtns: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  position: "relative",
  zIndex: 9999,
};

const title: React.CSSProperties = {
  color: "#7dd3fc",
  fontSize: 26,
  margin: 0,
  fontWeight: 900,
  letterSpacing: 0.3,
  textShadow: "0 0 24px rgba(125,211,252,0.25)",
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const label: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: 12,
  marginBottom: 6,
  fontWeight: 800,
  letterSpacing: 0.4,
  textTransform: "uppercase",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "rgba(2,6,23,0.55)",
  color: "#e2e8f0",
  outline: "none",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
};

const textarea: React.CSSProperties = {
  ...input,
  minHeight: 100,
  resize: "vertical",
};

const micBtn: React.CSSProperties = {
  position: "absolute",
  right: 10,
  top: 10,
  background: "linear-gradient(90deg,#ef4444,#f97316)",
  border: "none",
  borderRadius: 12,
  padding: "8px 12px",
  cursor: "pointer",
  color: "white",
  fontWeight: 900,
  boxShadow: "0 12px 25px rgba(239,68,68,0.25)",
};

const micBtn2: React.CSSProperties = {
  position: "absolute",
  right: 10,
  top: 10,
  background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
  border: "none",
  borderRadius: 12,
  padding: "8px 10px",
  cursor: "pointer",
  color: "white",
  fontWeight: 900,
  boxShadow: "0 12px 25px rgba(236,72,153,0.18)",
};

const sectionTitleRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  marginTop: 6,
};

const sectionTitle: React.CSSProperties = {
  fontWeight: 900,
  letterSpacing: 0.2,
  color: "#e2e8f0",
};

const sectionBadge: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(56,189,248,0.12)",
  border: "1px solid rgba(56,189,248,0.25)",
  color: "#bae6fd",
  fontWeight: 800,
};

const sectionBadge2: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(139,92,246,0.12)",
  border: "1px solid rgba(139,92,246,0.25)",
  color: "#ddd6fe",
  fontWeight: 800,
};

const sectionBadge3: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.25)",
  color: "#bbf7d0",
  fontWeight: 800,
};

const sectionBadgeFuel: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(245,158,11,0.12)",
  border: "1px solid rgba(245,158,11,0.25)",
  color: "#fde68a",
  fontWeight: 800,
};

const refGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
  gap: 10,
};

const refItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "rgba(2,6,23,0.55)",
  padding: "10px 10px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.22)",
  color: "#e2e8f0",
  cursor: "pointer",
};

const fuelCard: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(245,158,11,0.18)",
  background: "linear-gradient(180deg,rgba(245,158,11,0.08),rgba(2,6,23,0.35))",
};

const photoRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
  marginTop: 14,
};

const photoBox: React.CSSProperties = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(2,6,23,0.35)",
};

const fileInput: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 12,
  border: "1px dashed rgba(148,163,184,0.35)",
  background: "rgba(2,6,23,0.35)",
  color: "#e2e8f0",
};

const photoImg: React.CSSProperties = {
  width: "100%",
  height: 220,
  objectFit: "cover",
  borderRadius: 12,
  marginTop: 10,
  border: "1px solid rgba(148,163,184,0.18)",
};

const photoPlaceholder: React.CSSProperties = {
  height: 220,
  borderRadius: 12,
  marginTop: 10,
  display: "grid",
  placeItems: "center",
  color: "#94a3b8",
  border: "1px dashed rgba(148,163,184,0.25)",
};

const actionsRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
  marginTop: 10,
};

const buttonPrimary: React.CSSProperties = {
  padding: "12px 16px",
  background: "linear-gradient(90deg,#22c55e,#06b6d4)",
  border: "none",
  borderRadius: 14,
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 18px 35px rgba(34,197,94,0.20)",
};

const buttonSecondary: React.CSSProperties = {
  padding: "12px 16px",
  background: "rgba(2,6,23,0.55)",
  border: "1px solid rgba(148,163,184,0.22)",
  borderRadius: 14,
  color: "#e2e8f0",
  fontWeight: 900,
  cursor: "pointer",
};

const buttonSecondary2: React.CSSProperties = {
  ...buttonSecondary,
  border: "1px solid rgba(139,92,246,0.35)",
};

const buttonWhats2: React.CSSProperties = {
  padding: "12px 16px",
  background: "linear-gradient(90deg,#16a34a,#22c55e)",
  border: "none",
  borderRadius: 14,
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 18px 35px rgba(34,197,94,0.18)",
};

const buttonNuevo: React.CSSProperties = {
  padding: "12px 16px",
  background: "linear-gradient(90deg,#f59e0b,#ef4444)",
  border: "none",
  borderRadius: 14,
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 18px 35px rgba(245,158,11,0.20)",
};

const btnGhost: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "rgba(2,6,23,0.45)",
  color: "#e2e8f0",
  cursor: "pointer",
  fontWeight: 900,
};

const btnGhost2: React.CSSProperties = {
  ...btnGhost,
  border: "1px solid rgba(139,92,246,0.35)",
};

const btnWhats: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(34,197,94,0.35)",
  background: "linear-gradient(90deg,#16a34a,#22c55e)",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const btnNuevo: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(90deg,#f59e0b,#ef4444)",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
  boxShadow: "0 8px 20px rgba(245,158,11,0.25)",
};

const footerNote: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.8,
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(2,6,23,0.35)",
  border: "1px solid rgba(148,163,184,0.14)",
};

const kpiWrap: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12,
  marginTop: 12,
};

const kpiCard: React.CSSProperties = {
  padding: 12,
  borderRadius: 16,
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(2,6,23,0.35)",
};

const kLabel: React.CSSProperties = {
  fontSize: 11,
  opacity: 0.8,
  fontWeight: 900,
  letterSpacing: 0.4,
  textTransform: "uppercase",
};

const kValue: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  marginTop: 6,
};

const chartCard: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(148,163,184,0.18)",
  background: "linear-gradient(180deg,rgba(59,130,246,0.10),rgba(2,6,23,0.35))",
  marginTop: 12,
};

const chartTitle: React.CSSProperties = {
  fontWeight: 900,
  color: "#e2e8f0",
};

const chartHint: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.75,
};

const bars: React.CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 12,
};

const barRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "110px 1fr 140px",
  gap: 10,
  alignItems: "center",
};

const barName: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  opacity: 0.9,
};

const barTrack: React.CSSProperties = {
  height: 12,
  borderRadius: 999,
  background: "rgba(148,163,184,0.18)",
  overflow: "hidden",
};

const barFill: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
};

const barVal: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  textAlign: "right",
  opacity: 0.9,
};