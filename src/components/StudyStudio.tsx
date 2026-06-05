import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Sparkles, BookOpen, Upload, Download, Copy, Check, 
  RefreshCw, Award, ArrowUpRight, HelpCircle, PenTool, Highlighter, 
  Trash2, Layers, AlertCircle, Plus, Eye, ChevronRight, FileText
} from "lucide-react";
import { ThemePalette } from "../utils/theme";
import { auth, db } from "../config/firebase";
import { collection, doc, addDoc, query, getDocs, where } from "firebase/firestore";

interface StudyStudioProps {
  isOpen: boolean;
  onClose: () => void;
  palette: ThemePalette;
  userName: string;
}

// Typed JSON structure for generated handwritten notes
interface GeneratedNote {
  topicName: string;
  subject: string;
  gradeStandard?: string;
  introduction: string;
  definition: string;
  keyConcepts: string;
  importantPoints: string[];
  detailedExplanation: string;
  diagrams: {
    title: string;
    asciiDiagram: string;
    caption?: string;
  }[];
  flowchartsText: string;
  importantTable?: {
    headers: string[];
    rows: string[][];
  };
  keyFacts: string[];
  previousYearQuestions: string[];
  vivaQuestions: {
    question: string;
    answer: string;
  }[];
  fiveMarksQuestions: {
    question: string;
    answer: string;
    importantPoints: string[];
    diagram?: string;
    flowchart?: string;
  }[];
  tenMarksQuestions: {
    question: string;
    detailedAnswer: string;
    stepByStepExplanation: string;
    diagram?: string;
    flowchart?: string;
    importantExamPoints: string[];
  }[];
  examNotes: string[];
  summary: string;
}

// Initial demo notes so the studio loads with rich content immediately!
const DEMO_NOTE: GeneratedNote = {
  topicName: "Thermodynamics - Heat Engines & Laws",
  subject: "Mechanical Engineering / Physics",
  gradeStandard: "University Exam Prep",
  introduction: "In classical thermodynamics, a heat engine is a system that converts heat or thermal energy to mechanical work, which it then delivers by bringing a working substance from a higher state temperature to a lower state temperature.",
  definition: "A system that converts heat into mechanical energy by undergoing a cyclic process. The thermal efficiency (η) is defined as:\n\nη = W / QH = (QH - QC) / QH = 1 - (QC / QH)",
  keyConcepts: "1. Heat Absorption: Working substance absorbs heat (QH) from a high-temperature reservoir.\n2. Work Output: Thermodynamic expansion does useful mechanical work (W).\n3. Heat Rejection: Residual unused heat (QC) is dumped to a low-temperature sink.",
  importantPoints: [
    "Operates strictly under cyclic paths, returning to its initial state.",
    "Thermal efficiency can never reach 100% as restricted by the Second Law of Thermodynamics (Kelvin-Planck statement).",
    "Carnot cycle defines the maximum theoretical upper bound of thermal efficiency.",
    "Irreversibilities like friction and turbulence always reduce practical efficiency."
  ],
  detailedExplanation: "A heat engine works by transferring energy from a warm source to a cold sink and converting a portion of this energy to mechanical work. This sequence of steps is repeated in cycles. The working substance (such as vapor or fuel-air mixture) expands, pushing a piston or spinning a turbine rotor, thereby transferring kinetic energy to mechanical output. The maximum possible efficiency of any such heat engine is dictated by the Carnot limit, which depends purely on the absolute temperatures of the source and the sink.",
  diagrams: [
    {
      title: "Heat Engine Energy Flow Schematic",
      asciiDiagram: `       Source (QH)
            │
            │ QH
            ▼
      ┌───────────┐
      │  Engine   │ ═════► Work (W)
      └───────────┘
            │
            │ QC
            ▼
        Sink (QC)`
    }
  ],
  flowchartsText: `Thermodynamic Energy Flow
│
├── Absorbs QH (High Temp Source)
│
├── Converts portion to Work (W = QH - QC)
│
└── Rejects waste QC to cold Sink`,
  importantTable: {
    headers: ["Feature", "Open System", "Closed System"],
    rows: [
      ["Mass Transfer", "Yes", "No"],
      ["Energy Transfer", "Yes", "Yes"],
      ["Examples", "Turbines, Pumps", "Piston Cylinder without valves"]
    ]
  },
  keyFacts: [
    "Sadi Carnot is regarded as the father of modern thermodynamics.",
    "Efficiency depends only on source temperature and sink temperature.",
    "An absolute zero thermodynamic sink is practically impossible to achieve."
  ],
  previousYearQuestions: [
    "State Second Law of Thermodynamics and outline Kelvin-Planck Statement with respect to Heat Engines. (10 Marks, 2024 Exam)",
    "Derive the efficiency expression for an ideal Carnot Cycle. (10 Marks, 2023 Exam)"
  ],
  vivaQuestions: [
    {
      question: "Q1. What is Thermodynamics?",
      answer: "Ans. Thermodynamics is the science dealing with heat and work interactions."
    },
    {
      question: "Q2. Can a real heat engine have 100% efficiency?",
      answer: "Ans. No, according to Kelvin-Planck statement, some portion of heat must be rejected to a low-temperature sink."
    },
    {
      question: "Q3. What is a sink in thermodynamic terms?",
      answer: "Ans. A sink is a thermal reservoir at lower temperature capable of absorbing infinite heat with no change in its temperature."
    },
    {
      question: "Q4. What is the efficiency formula of Carnot engine?",
      answer: "Ans. Efficiency η = 1 - (T_C / T_H), where temperatures are strictly in Kelvin scale."
    },
    {
      question: "Q5. State Kelvin-Planck Statement.",
      answer: "Ans. It is impossible to construct a device operating in a cycle whose sole effect is to extract heat from a single reservoir and produce equivalent net work."
    }
  ],
  fiveMarksQuestions: [
    {
      question: "Q1. Explain Heat Engine.",
      answer: "A heat engine is a device operating in a thermodynamic cycle, receiving heat from a high-temperature reservoir, converting a portion of it into work, and rejecting the remaining portion to a low-temperature reservoir.",
      importantPoints: [
        "Consists of a source, sink, and working substance.",
        "Energy is conserved at all times (QH = W + QC).",
        "W represents net work delivered out of the system."
      ],
      diagram: `       QH
       ↓
 ┌─────────┐
 │ Engine  │
 └─────────┘
       ↓ W
       ↓
      QC`
    }
  ],
  tenMarksQuestions: [
    {
      question: "Q1. Explain Classification of Animal Kingdom (or Carnot Cycle Operation).",
      detailedAnswer: "To understand biological or physical system classifications, we group items systematically. For instance, the Animal Kingdom is classified hierarchically depending on structural complexity and symmetry. First, organisms are classified into Non-Chordata and Chordata based on the absence or presence of a notochord. Similarly, in physical cycles, engines are structured under power cycles or refrigeration cycles to categorize efficiency.",
      stepByStepExplanation: "1. Phase 1: Cell division and tissue differentiation.\n2. Phase 2: Organ system development.\n3. Phase 3: Symmetry formation (Radial vs Bilateral).\n4. Phase 4: Coelom configuration (Pseudocoelomate vs Coelomate).",
      importantExamPoints: [
        "Remember to highlight the unique water vascular system in Echinodermata.",
        "Nerve cord in non-chordates is double, ventral and solid, whereas in chordates it is single, dorsal and hollow."
      ],
      flowchart: `Animal Kingdom
│
├── Non-Chordata
│
└── Chordata
    ├── Pisces
    ├── Amphibia
    ├── Reptilia
    ├── Aves
    └── Mammalia`
    }
  ],
  examNotes: [
    "Keep Carnot efficiency equation T_C / T_H units strictly in Kelvin! Do not use Celsius directly.",
    "Work output is positive when heat flows from hot to cold environment."
  ],
  summary: "Thermodynamics operates on heat engine transformations converting energy sources to output works via cyclic paths of compression, heating, expansion, and cooling."
};

export default function StudyStudio({ isOpen, onClose, palette, userName }: StudyStudioProps) {
  const [activeTab, setActiveTab] = useState<"create" | "pyq" | "scan" | "savedNotes">("create");
  
  // Input states
  const [topicInput, setTopicInput] = useState("");
  const [pyqQuery, setPyqQuery] = useState("");
  const [marksType, setMarksType] = useState<"5" | "10">("5");
  const [subjectType, setSubjectType] = useState("Engineering Sciences");
  
  // File Upload states
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string>("");

  // Notebook aesthetics
  const [paperStyle, setPaperStyle] = useState<"ruled" | "bullet" | "blueprint">("ruled");
  const [inkColor, setInkColor] = useState<string>("#1e3a8a"); // Pilot Blue, Blue ink, Black block
  const [showDoodles, setShowDoodles] = useState(true);

  // Notes state
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote>(DEMO_NOTE);
  const [savedNotes, setSavedNotes] = useState<GeneratedNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Doodle Canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushMode, setBrushMode] = useState<"pen" | "highlighter" | "eraser">("pen");
  const [brushColor, setBrushColor] = useState("#e11d48"); // Red pen default
  const canvasPointsRef = useRef<{ x: number; y: number; isDrag: boolean; color: string; width: number; mode: string }[]>([]);

  // Clear file
  const removeFile = () => {
    setFile(null);
    setFileBase64(null);
    setFileType("");
    setOcrStatus("");
  };

  // Convert File to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFileType(selected.type);
      setOcrStatus("Processing file...");

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(",")[1];
        if (base64String) {
          setFileBase64(base64String);
          setOcrStatus("Document ready for analysis!");
        } else {
          setOcrStatus("Failed to process document file.");
        }
      };
      reader.readAsDataURL(selected);
    }
  };

  // File drag & drop setup
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setFileType(selected.type);
      setOcrStatus("Processing file...");

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(",")[1];
        if (base64String) {
          setFileBase64(base64String);
          setOcrStatus("Document dropped and loaded successfully!");
        } else {
          setOcrStatus("Failed to extract background binary.");
        }
      };
      reader.readAsDataURL(selected);
    }
  };

  // Canvas drawing logics for hand drawn overlay
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    addPoint(x, y, false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    addPoint(x, y, true);
    redrawCanvas();
  };

  const handleMouseUpOrLeave = () => {
    setIsDrawing(false);
  };

  const addPoint = (x: number, y: number, isDrag: boolean) => {
    let width = 2.5;
    let color = brushColor;
    if (brushMode === "highlighter") {
      width = 20;
      color = "#fef08a99"; // Translucent highlighter yellow
    } else if (brushMode === "eraser") {
      width = 18;
      color = "#fcf8e3"; // Matches notebook background
      if (paperStyle === "blueprint") {
        color = "#0b1528";
      }
    }

    canvasPointsRef.current.push({
      x,
      y,
      isDrag,
      color,
      width,
      mode: brushMode
    });
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const points = canvasPointsRef.current;
    if (points.length === 0) return;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (let i = 0; i < points.length; i++) {
      ctx.strokeStyle = points[i].color;
      ctx.lineWidth = points[i].width;

      // Transparent drawing modes setup
      if (points[i].mode === "highlighter") {
        ctx.globalCompositeOperation = "multiply";
      } else {
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.beginPath();
      if (points[i].isDrag && i > 0) {
        ctx.moveTo(points[i - 1].x, points[i - 1].y);
      } else {
        ctx.moveTo(points[i].x - 1, points[i].y);
      }
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    canvasPointsRef.current = [];
    redrawCanvas();
  };

  // Adjust canvas size when window changes or component loads
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas && canvas.parentElement) {
          canvas.width = canvas.parentElement.clientWidth;
          canvas.height = canvas.parentElement.clientHeight;
          redrawCanvas();
        }
      }, 500);
    }
  }, [isOpen, paperStyle, generatedNote]);

  // Fetch saved notes on tab change
  useEffect(() => {
    if (activeTab === "savedNotes" && auth.currentUser) {
      const fetchSavedNotes = async () => {
        try {
          const q = query(collection(db, "users", auth.currentUser!.email!, "savedNotes"));
          const querySnapshot = await getDocs(q);
          const notes: GeneratedNote[] = [];
          querySnapshot.forEach((doc) => {
            notes.push(doc.data() as GeneratedNote);
          });
          setSavedNotes(notes);
        } catch (e) {
          console.error("Error fetching notes: ", e);
        }
      };
      fetchSavedNotes();
    }
  }, [activeTab]);

  // Generate Notes using backend proxy API
  const generateHandwrittenNotes_API = async (modeType: "create" | "pyq" | "scan") => {
    setLoading(true);
    setStatusMsg("Connecting with Lisa's brain cells...");
    
    try {
      if (modeType === "create") {
        if (!topicInput.trim()) {
          alert("Topic name daalo malka!");
          setLoading(false);
          return;
        }
      } else if (modeType === "pyq") {
        if (!pyqQuery.trim()) {
          alert("Question paper toh batao pehle!");
          setLoading(false);
          return;
        }
      } else if (modeType === "scan") {
        if (!fileBase64) {
          alert("Suno, pehle question ki photo ya PDF toh upload karo!");
          setLoading(false);
          return;
        }
      }

      setStatusMsg("Writing beautifully in topper ink... ✍️");
      
      const res = await fetch("/api/study/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          modeType,
          topicInput,
          subjectType,
          pyqQuery,
          fileBase64,
          fileType
        })
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const responseText = data.text;
      if (responseText) {
        try {
          const parsed: GeneratedNote = JSON.parse(responseText);
          setGeneratedNote(parsed);
          clearCanvas(); // Clear scratch drawings on new generation
          setStatusMsg("");
        } catch (e) {
          console.error("JSON Parsing failed", e);
          alert("Opps! Formatting error aaya, description padhne me. Par aap firse try karein!");
        }
      }
    } catch (err: any) {
      console.error("Study notes AI generation failed", err);
      alert("Error generating notes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveNoteToFirestore = async () => {
    if (!auth.currentUser || !generatedNote) return;
    try {
      const notesCollection = collection(db, "users", auth.currentUser.email!, "savedNotes");
      await addDoc(notesCollection, {
        ...generatedNote,
        createdAt: Date.now()
      });
      alert("Note saved!");
    } catch (e) {
      console.error("Error saving note: ", e);
      alert("Error saving note!");
    }
  };

  // Printing Layout directly via browser native window (best for standard high definition styled margins)
  const handlePrint = () => {
    const printableArea = document.getElementById("lisa-handwritten-ruled-note-sheet");
    if (!printableArea) return;

    // Create sandbox print style
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print your handwritten classroom notes!");
      return;
    }

    // Capture drawings from active canvas overlay
    const canvas = canvasRef.current;
    const canvasDataUrl = canvas ? canvas.toDataURL("image/png") : "";

    let cleanNotebookHTML = `
      <html>
        <head>
          <title>${generatedNote.topicName} - Lisa's Exam Notes Pro</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Caveat:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap">
          <style>
            body {
              background-color: #fcf8e3;
              color: ${inkColor};
              font-family: 'Kalam', 'Caveat', cursive;
              padding: 20px;
              margin: 0;
            }
            .notebook-page {
              background-color: #fcf8e3;
              position: relative;
              border: 1px solid #d4d4d8;
              box-shadow: 0 4px 10px rgba(0,0,0,0.05);
              border-radius: 8px;
              padding: 50px 40px 40px 85px;
              margin-bottom: 25px;
              min-height: 1000px;
              box-sizing: border-box;
              background-image: linear-gradient(#e1f0fa 1px, transparent 1px);
              background-size: 100% 28px;
              line-height: 28px;
              page-break-inside: avoid;
            }
            .notebook-page::before {
              content: "";
              position: absolute;
              top: 0;
              left: 60px;
              width: 2px;
              height: 100%;
              background-color: #f87171;
            }
            h1 {
              font-size: 32px;
              color: #b91c1c;
              margin-top: 0;
              margin-bottom: 5px;
              border-bottom: 2px solid #b91c1c;
              padding-bottom: 8px;
            }
            h2 {
              font-size: 22px;
              color: #b91c1c;
              margin-top: 25px;
              margin-bottom: 10px;
              text-decoration: underline;
              border-bottom: 1px dotted rgba(0,0,0,0.1);
              padding-bottom: 4px;
            }
            p {
              font-size: 16px;
              margin: 12px 0;
              text-align: justify;
            }
            ul, ol {
              margin: 10px 0 10px 20px;
            }
            li {
              font-size: 15px;
              margin: 6px 0;
            }
            pre {
              font-family: 'JetBrains Mono', monospace;
              font-size: 13px;
              background-color: rgba(255, 255, 255, 0.4);
              border: 1px dashed ${inkColor}88;
              padding: 12px;
              border-radius: 8px;
              line-height: 18px;
              overflow-x: auto;
              white-space: pre;
              margin: 15px 0;
            }
            .concept-highlight {
              background-color: #fef08a; /* Yellow highlighter */
              border-radius: 3px;
              padding: 1px 4px;
              border: 1px dotted #eab308;
            }
            .exam-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 14px;
            }
            .exam-table th {
              background-color: rgba(0,0,0,0.05);
              border: 1.5px solid ${inkColor};
              padding: 8px;
              text-align: left;
              color: #b91c1c;
            }
            .exam-table td {
              border: 1.5px solid ${inkColor};
              padding: 8px;
            }
            .question-box {
              background-color: rgba(185, 28, 28, 0.03);
              border-left: 4px solid #b91c1c;
              padding: 12px 16px;
              margin: 15px 0;
              border-radius: 4px;
            }
            .question-title {
              font-weight: bold;
              color: #b91c1c;
              font-size: 17px;
              margin-bottom: 8px;
            }
            .canvas-overlay-img {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;
              z-index: 10;
            }
            @media print {
              body {
                background-color: #fff;
              }
              .notebook-page {
                box-shadow: none;
                border: none;
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          <center>
            <div style="font-family: system-ui; font-size: 12px; color: #666; margin-bottom: 25px;">
              Generated beautifully by Lisa's AI Study Assistant for ${userName}
            </div>
          </center>

          <!-- PAGE 1: Topic Overview & Core Framework -->
          <div class="notebook-page">
            ${canvasDataUrl ? `<img src="${canvasDataUrl}" class="canvas-overlay-img" />` : ""}
            <h1># ${generatedNote.topicName}</h1>
            <div style="font-size: 13px; opacity: 0.7; font-family: monospace; margin-top: -5px; margin-bottom: 20px;">
              Subject: ${generatedNote.subject} | Grade Standard: ${generatedNote.gradeStandard || "EXAM LEVEL"}
            </div>

            <h2>## Introduction</h2>
            <p>${generatedNote.introduction}</p>

            <h2>## Definition</h2>
            <div class="concept-highlight" style="padding: 15px; border-radius: 8px; border: 1.5px dashed #eab308; display: block; margin-top: 10px; background-color: #fffdec; color: #0f172a; line-height: 24px;">
              ${generatedNote.definition}
            </div>

            <h2>## Key Concepts</h2>
            <p style="white-space: pre-wrap;">${generatedNote.keyConcepts}</p>
          </div>

          <!-- PAGE 2: Quick Recap, Facts & Diagrammatic Section -->
          <div class="notebook-page">
            <h2>## Important Points</h2>
            <ul>
              ${generatedNote.importantPoints.map(point => `<li>⚡ ${point}</li>`).join("")}
            </ul>

            <h2>## Detailed Explanation</h2>
            <p>${generatedNote.detailedExplanation}</p>

            ${generatedNote.diagrams && generatedNote.diagrams.length > 0 ? `
              <h2>## Diagram</h2>
              ${generatedNote.diagrams.map(diag => `
                <div style="margin: 15px 0;">
                  <div style="font-weight: bold; color: #1e3b8a; margin-bottom: 5px;">${diag.title}</div>
                  <pre>${diag.asciiDiagram}</pre>
                  ${diag.caption ? `<div style="font-size: 13px; opacity: 0.8; font-style: italic;">[${diag.caption}]</div>` : ""}
                </div>
              `).join("")}
            ` : ""}
          </div>

          <!-- PAGE 3: Flows, Comparisons & Facts -->
          <div class="notebook-page">
            <h2>## Flowchart</h2>
            <pre>${generatedNote.flowchartsText}</pre>

            ${generatedNote.importantTable ? `
              <h2>## Important Table</h2>
              <table class="exam-table">
                <thead>
                  <tr>
                    ${generatedNote.importantTable.headers.map(h => `<th>${h}</th>`).join("")}
                  </tr>
                </thead>
                <tbody>
                  ${generatedNote.importantTable.rows.map(row => `
                    <tr>
                      ${row.map(cell => `<td>${cell}</td>`).join("")}
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            ` : ""}

            <h2>## Key Facts</h2>
            <ul>
              ${generatedNote.keyFacts.map(fact => `<li>📌 ${fact}</li>`).join("")}
            </ul>

            <h2>## Previous Year Questions</h2>
            <ol>
              ${generatedNote.previousYearQuestions.map(pyq => `<li>📝 <b style="color: #b91c1c;">PYQ:</b> ${pyq}</li>`).join("")}
            </ol>
          </div>

          <!-- PAGE 4: Oral Preparation & Medium Scale Answers -->
          <div class="notebook-page">
            <h2>## Viva Questions</h2>
            ${generatedNote.vivaQuestions.map(vq => `
              <div class="question-box">
                <div class="question-title">${vq.question}</div>
                <div style="color: ${inkColor};">${vq.answer}</div>
              </div>
            `).join("")}

            <h2>## 5 Marks Questions</h2>
            ${generatedNote.fiveMarksQuestions.map(q => `
              <div class="question-box">
                <div class="question-title">${q.question}</div>
                <div style="margin-bottom: 10px; font-weight: 500;"><b>Answer:</b> ${q.answer}</div>
                
                ${q.importantPoints && q.importantPoints.length > 0 ? `
                  <div style="margin: 8px 0;">
                    <b>Key Concept Points:</b>
                    <ul>
                      ${q.importantPoints.map(pt => `<li>⚡ ${pt}</li>`).join("")}
                    </ul>
                  </div>
                ` : ""}

                ${q.diagram ? `
                  <strong>Required Diagram:</strong>
                  <pre>${q.diagram}</pre>
                ` : ""}

                ${q.flowchart ? `
                  <strong>Required Flowchart:</strong>
                  <pre>${q.flowchart}</pre>
                ` : ""}
              </div>
            `).join("")}
          </div>

          <!-- PAGE 5: Essay Answers & Summary Capsule -->
          <div class="notebook-page">
            <h2>## 10 Marks Questions</h2>
            ${generatedNote.tenMarksQuestions.map(q => `
              <div class="question-box">
                <div class="question-title">${q.question}</div>
                <div style="margin-bottom: 10px;"><b>Detailed Answer:</b> ${q.detailedAnswer}</div>
                
                <div style="margin: 10px 0; padding-left: 10px; border-left: 2px dashed ${inkColor}aa;">
                  <b>Step-by-step Explanation:</b>
                  <p style="white-space: pre-line;">${q.stepByStepExplanation}</p>
                </div>

                ${q.importantExamPoints && q.importantExamPoints.length > 0 ? `
                  <div style="margin: 10px 0;">
                    <b>Important Exam Evaluation Points:</b>
                    <ul>
                      ${q.importantExamPoints.map(pt => `<li>⚡ ${pt}</li>`).join("")}
                    </ul>
                  </div>
                ` : ""}

                ${q.diagram ? `
                  <strong>Required labelled Diagram:</strong>
                  <pre>${q.diagram}</pre>
                ` : ""}

                ${q.flowchart ? `
                  <strong>Operation Flowchart:</strong>
                  <pre>${q.flowchart}</pre>
                ` : ""}
              </div>
            `).join("")}

            <h2>## Exam Notes</h2>
            <ul>
              ${generatedNote.examNotes.map(n => `<li>🔥 ${n}</li>`).join("")}
            </ul>

            <h2>## Summary</h2>
            <div style="background-color: #fff9db; border: 1.5px solid ${inkColor}bb; padding: 15px; border-radius: 8px; font-style: italic; font-weight: 500; color: #1e293b;">
              📝 ${generatedNote.summary}
            </div>
          </div>
        </body>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          }
        </script>
      </html>
    `;

    printWindow.document.write(cleanNotebookHTML);
    printWindow.document.close();
  };

  // Helper function to color code nodes inside hand-drawn flowchart
  const getNodeColorClass = (type: string) => {
    switch(type) {
      case "start": return "border-emerald-600 bg-emerald-50 text-emerald-950";
      case "end": return "border-rose-600 bg-rose-50 text-rose-950";
      case "decision": return "border-amber-600 bg-amber-50 text-amber-950 font-semibold";
      default: return "border-blue-700 bg-blue-50 text-blue-900";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 w-full h-full bg-[#03070c]/90 backdrop-blur-md flex items-center justify-center z-50 overflow-hidden p-3 md:p-6 select-none pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="w-full max-w-7xl h-full bg-[#0d121c] border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
        >
          {/* Header glowing neon line */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${palette.accentGradient}`} />

          {/* LEFT SIDE PANEL: Controls, Inputs, File Uploader */}
          <div className="w-full md:w-[32%] border-r border-white/10 flex flex-col h-full bg-[#0a0d14]/70 p-4 overflow-y-auto shrink-0 scrollbar-hide">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${palette.avatarBg} flex items-center justify-center text-white`}>
                <BookOpen size={16} />
              </div>
              <div>
                <h2 className="text-base font-serif font-semibold text-white tracking-wide">Lisa Study Studio</h2>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Handwritten Exam Notes</p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-white/[0.03] p-1 rounded-xl mb-4 border border-white/5">
              <button
                onClick={() => setActiveTab("create")}
                className={`py-3 min-h-[44px] text-[10px] uppercase font-mono tracking-wider font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "create" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/70"
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setActiveTab("pyq")}
                className={`py-3 min-h-[44px] text-[10px] uppercase font-mono tracking-wider font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "pyq" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/70"
                }`}
              >
                PYQ
              </button>
              <button
                onClick={() => setActiveTab("scan")}
                className={`py-3 min-h-[44px] text-[10px] uppercase font-mono tracking-wider font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "scan" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/70"
                }`}
              >
                Scan
              </button>
              <button
                onClick={() => setActiveTab("savedNotes")}
                className={`py-3 min-h-[44px] text-[10px] uppercase font-mono tracking-wider font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "savedNotes" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/70"
                }`}
              >
                Saved
              </button>
            </div>

            {/* Render form fields based on selected mode */}
            <div className="flex-1 space-y-4">
              {activeTab === "create" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Concept / Topic Name</label>
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="e.g. Krebs Cycle, Photosynthesis, Neural Networks..."
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none transition-all font-sans"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Subject Classification</label>
                    <select
                      value={subjectType}
                      onChange={(e) => setSubjectType(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="Biochemistry & Biology">Biochemistry & Biology</option>
                      <option value="Machine Learning / CS">Machine Learning / Computer Science</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Thermodynamics Physics">Thermodynamics Physics</option>
                      <option value="Civil Earth Sciences">Civil Earth Sciences</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "pyq" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Write or Paste Exam Question</label>
                    <textarea
                      value={pyqQuery}
                      onChange={(e) => setPyqQuery(e.target.value)}
                      rows={4}
                      placeholder="e.g. Explain cyclic and non-cyclic photophosphorylation. Give differences and step by step flowchart."
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-pink-500 rounded-xl p-3 text-xs text-white placeholder-white/20 outline-none transition-all font-sans resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {activeTab === "scan" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Scan / Upload Paper</label>
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-white/40 hover:border-cyan-500/50 transition-all cursor-pointer"
                    >
                      <Upload size={24} />
                      <p className="text-xs">Drag or click to upload</p>
                      <input type="file" className="hidden" onChange={handleFileChange} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "savedNotes" && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search saved notes..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none"
                  />
                  <div className="space-y-2">
                    {savedNotes.filter(n => n.topicName.toLowerCase().includes(searchQuery.toLowerCase())).map((note, index) => (
                      <button 
                        key={index}
                        onClick={() => setGeneratedNote(note)}
                        className="w-full text-left p-3 bg-white/[0.03] rounded-lg text-white/70 text-xs hover:bg-white/10"
                      >
                        {note.topicName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "pyq" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Write or Paste Exam Question</label>
                    <textarea
                      value={pyqQuery}
                      onChange={(e) => setPyqQuery(e.target.value)}
                      rows={4}
                      placeholder="e.g. Explain cyclic and non-cyclic photophosphorylation. Give differences and step by step flowchart."
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-pink-500 rounded-xl p-3 text-xs text-white placeholder-white/20 outline-none transition-all font-sans resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Exam Marks Schema</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setMarksType("5")}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                          marksType === "5"
                            ? "bg-rose-500/10 border-rose-500 text-rose-300"
                            : "bg-white/[0.02] border-white/5 text-white/50 hover:text-white/80"
                        }`}
                      >
                        <Award size={14} />
                        <span>5 Marks Standard</span>
                      </button>
                      <button
                        onClick={() => setMarksType("10")}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                          marksType === "10"
                            ? "bg-amber-500/10 border-amber-500 text-amber-300 animate-pulse"
                            : "bg-white/[0.02] border-white/5 text-white/50 hover:text-white/80"
                        }`}
                      >
                        <Sparkles size={14} />
                        <span>10 Marks Standard</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "scan" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider font-semibold">Upload Question Doc (PDF/PNG/JPG)</label>
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-white/10 hover:border-emerald-500 bg-white/[0.02] p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-2 group min-h-[140px]"
                    >
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="document-notes-uploader"
                      />
                      <label htmlFor="document-notes-uploader" className="flex flex-col items-center justify-center cursor-pointer">
                        <Upload size={24} className="text-white/30 group-hover:text-emerald-400 group-hover:scale-110 transition-all mb-1" />
                        <span className="text-xs font-medium text-white/80">Question paper ya photo khicho</span>
                        <span className="text-[9px] font-mono text-white/30 mt-0.5">Drag & Drop PDF or Image file</span>
                      </label>
                    </div>
                  </div>

                  {file && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText size={16} className="text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{file.name}</p>
                          <p className="text-[9px] font-mono text-white/40 uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {ocrStatus && (
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 px-1 italic">
                      <Check size={12} />
                      <span>{ocrStatus}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Design Controls */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Notebook Accent Color</span>
                  <div className="flex items-center gap-1.5">
                    {["#1e3a8a", "#0f172a", "#15803d", "#9d174d"].map((col) => (
                      <button
                        key={col}
                        onClick={() => setInkColor(col)}
                        className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                          inkColor === col ? "scale-125 border-white ring-2 ring-white/10" : "border-transparent"
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider font-semibold">Ruled Style</span>
                  <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/5 text-[9px] font-mono">
                    <button
                      onClick={() => setPaperStyle("ruled")}
                      className={`px-2 py-1 rounded transition-colors cursor-pointer ${paperStyle === "ruled" ? "bg-white/10 text-white" : "text-white/50"}`}
                    >
                      Ruled
                    </button>
                    <button
                      onClick={() => setPaperStyle("blueprint")}
                      className={`px-2 py-1 rounded transition-colors cursor-pointer ${paperStyle === "blueprint" ? "bg-white/10 text-white" : "text-white/50"}`}
                    >
                      BluePrint
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="pt-4 mt-4 border-t border-white/5 shrink-0">
              <button
                disabled={loading}
                onClick={() => generateHandwrittenNotes_API(activeTab)}
                className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  activeTab === "create"
                    ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/10"
                    : activeTab === "pyq"
                    ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/10"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/10"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>{statusMsg || "Aey! Lisa dimaag laga rhi hai..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Compile Handwritten Notes</span>
                  </>
                )}
              </button>
              <p className="text-[9px] text-center text-white/35 font-mono mt-2 leading-relaxed italic">
                "Z-Scheme ho ya organic reactions, topper backbencher Lisa sab banadegi!"
              </p>
            </div>
          </div>

          {/* RIGHT SIDE PANEL: Handwritten Realistic Book Canvas */}
          <div className="flex-1 flex flex-col h-full bg-[#080b11] overflow-hidden">
            {/* Top Bar inside preview */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0 bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-white/60">HAND-DRAWN STUDY CANVAS PREVIEW</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Doodler Canvas Tools */}
                <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-xl p-0.5 overflow-hidden">
                  <button
                    onClick={() => setBrushMode("pen")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${brushMode === "pen" ? "bg-rose-500/15 text-rose-400" : "text-white/40 hover:text-white/60"}`}
                    title="Ballpoint Marker (Sign, sketch notes)"
                  >
                    <PenTool size={13} />
                  </button>
                  <button
                    onClick={() => setBrushMode("highlighter")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${brushMode === "highlighter" ? "bg-yellow-500/15 text-yellow-300" : "text-white/40 hover:text-white/60"}`}
                    title="Transparent Yellow Highlighter"
                  >
                    <Highlighter size={13} />
                  </button>
                  <button
                    onClick={() => setBrushMode("eraser")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${brushMode === "eraser" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
                    title="Scratchpad Rubber Eraser"
                  >
                    <Trash2 size={13} />
                  </button>
                  {canvasPointsRef.current.length > 0 && (
                    <button
                      onClick={clearCanvas}
                      className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer"
                      title="Clear Scribbles Board"
                    >
                      <Trash2 size={13} className="text-red-400/70" />
                    </button>
                  )}
                </div>

                <button
                  onClick={saveNoteToFirestore}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 transition-all text-xs font-mono flex items-center gap-1.5 text-emerald-400 cursor-pointer border border-emerald-500/20"
                  title="Save note to Firestore"
                >
                  <Check size={13} />
                  <span>Save Note</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-mono flex items-center gap-1.5 text-white/80 cursor-pointer border border-white/10"
                  title="Print note or save clean high-def PDF"
                >
                  <Download size={13} />
                  <span>Download / Print Notes</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Simulated Ruled notebook scroll container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8 scroll-smooth select-text">
              <div 
                id="lisa-handwritten-ruled-note-sheet"
                className={`w-full max-w-4xl mx-auto rounded-2xl relative shadow-2xl min-h-[900px] border transition-all overflow-hidden flex flex-col ${
                  paperStyle === "ruled" 
                    ? "bg-[#fcf8e3] border-amber-900/10 text-[#1a2d5a]" 
                    : "bg-[#0b1528] border-cyan-500/10 text-cyan-200"
                }`}
                style={{
                  backgroundImage: paperStyle === "ruled"
                    ? "linear-gradient(#e1f0fa 1px, transparent 1px)"
                    : "linear-gradient(#1e293b 1px, transparent 1px)",
                  backgroundSize: "100% 28px",
                  lineHeight: "28px"
                }}
              >
                {/* Notebook vertical left pink margin margin rule */}
                <div 
                  className={`absolute top-0 bottom-0 left-[60px] w-0.5 border-r pointer-events-none ${
                    paperStyle === "ruled" ? "border-rose-400/70" : "border-rose-500/30"
                  }`} 
                />

                {/* Hand-drawn Interactive Scratch Canvas Overlay layer */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className="absolute inset-0 w-full h-full pointer-events-auto z-10 cursor-crosshair opacity-90 mix-blend-multiply"
                />

                {/* Standard study header container (aligned right of margin line) */}
                <div className="relative pl-[85px] pr-6 md:pr-10 pt-10 pb-6 shrink-0 z-0">
                  <div className="flex flex-col border-b border-rose-400/50 pb-3 mb-6">
                    <span 
                      className={`text-2xl font-handwritten font-bold tracking-wide leading-tight ${
                        paperStyle === "ruled" ? "text-red-700" : "text-rose-400"
                      }`}
                    >
                      # {generatedNote.topicName}
                    </span>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-mono tracking-wider opacity-60">
                      <span className={paperStyle === "ruled" ? "text-[#1e3a8a]/70" : "text-sky-400/70"}>
                        <b>Subject:</b> {generatedNote.subject}
                      </span>
                      {generatedNote.gradeStandard && (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <span>★ {generatedNote.gradeStandard.toUpperCase()}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary notes box */}
                  <div 
                    className={`rounded-xl p-4 my-2 border font-handwritten text-xs md:text-sm italic tracking-wide leading-relaxed ${
                      paperStyle === "ruled" 
                        ? "bg-amber-100/40 border-amber-200 text-[#2563eb]" 
                        : "bg-blue-950/20 border-cyan-500/10 text-cyan-400"
                    }`}
                  >
                    💡 <span className="font-semibold uppercase tracking-wider mr-1 font-mono text-[10px]">Notebook Summary:</span> 
                    {generatedNote.summary}
                  </div>
                </div>

                {/* Inner Pages containing handwritten notes content */}
                <div className="relative pl-[85px] pr-6 md:pr-10 pb-16 space-y-12 z-0 flex-1 font-handwritten text-[15px] sm:text-[16px] leading-[28px] tracking-wide" style={{ color: paperStyle === "ruled" ? inkColor : "#e0f2fe" }}>
                  
                  {/* INTRODUCTION */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## Introduction
                    </h3>
                    <p className="leading-relaxed opacity-95 text-justify">
                      {generatedNote.introduction}
                    </p>
                  </div>

                  {/* DEFINITIONS */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## Definition
                    </h3>
                    <div className="p-4 rounded-xl border border-dashed bg-yellow-200/20 border-yellow-400/40 text-rose-800 font-semibold shadow-sm leading-relaxed whitespace-pre-wrap">
                      {generatedNote.definition}
                    </div>
                  </div>

                  {/* KEY CONCEPTS */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## Key Concepts
                    </h3>
                    <div className="whitespace-pre-wrap opacity-95">
                      {generatedNote.keyConcepts}
                    </div>
                  </div>

                  {/* IMPORTANT POINTS */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## Important Points
                    </h3>
                    <ul className="space-y-1.5 pl-2">
                      {generatedNote.importantPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-500 shrink-0 text-sm mt-0.5">⚡</span>
                          <span className="opacity-95">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* DETAILED EXPLANATION */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## Detailed Explanation
                    </h3>
                    <p className="leading-relaxed opacity-95 text-justify">
                      {generatedNote.detailedExplanation}
                    </p>
                  </div>

                  {/* DIAGRAMS */}
                  {generatedNote.diagrams && generatedNote.diagrams.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                        ## Diagram
                      </h3>
                      {generatedNote.diagrams.map((diag, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="text-xs font-mono font-bold tracking-wider opacity-60 uppercase">
                            🖼️ {diag.title}
                          </div>
                          <pre className="font-mono text-xs sm:text-sm leading-relaxed p-4 rounded-xl overflow-x-auto whitespace-pre bg-black/5 dark:bg-white/5 border border-dashed border-red-500/20 shadow-inner select-all">
                            {diag.asciiDiagram}
                          </pre>
                          {diag.caption && (
                            <p className="text-xs italic opacity-70 pl-2">
                              [{diag.caption}]
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FLOWCHART */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## Flowchart
                    </h3>
                    <pre className="font-mono text-xs sm:text-sm leading-relaxed p-4 rounded-xl overflow-x-auto whitespace-pre bg-black/5 dark:bg-white/5 border border-dashed border-cyan-500/20 shadow-inner select-all">
                      {generatedNote.flowchartsText}
                    </pre>
                  </div>

                  {/* IMPORTANT TABLES */}
                  {generatedNote.importantTable && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                        ## Important Table
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-red-700/20 shadow-sm bg-white/10">
                        <table className="min-w-full divide-y divide-red-700/10 text-left font-handwritten text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-red-700/5">
                              {generatedNote.importantTable.headers.map((hdr, idx) => (
                                <th key={idx} className="px-3 py-2 border border-red-700/25 font-bold text-rose-800">
                                  {hdr}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-700/10">
                            {generatedNote.importantTable.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-3 py-2 border border-red-700/20">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* KEY FACTS */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## Key Facts
                    </h3>
                    <ul className="space-y-1.5 pl-2">
                      {generatedNote.keyFacts.map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-500 shrink-0 text-xs mt-1">📌</span>
                          <span className="opacity-95">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* PREVIOUS YEAR QUESTIONS */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## Previous Year Questions
                    </h3>
                    <ul className="space-y-1.5 pl-2">
                      {generatedNote.previousYearQuestions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold shrink-0 text-xs">📝</span>
                          <span className="font-semibold text-rose-800 dark:text-rose-300">{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* VIVA QUESTIONS */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## Viva Questions
                    </h3>
                    <div className="space-y-3">
                      {generatedNote.vivaQuestions.map((vq, idx) => (
                        <div key={idx} className="p-3.5 rounded-lg border border-rose-300/30 bg-rose-500/5 shadow-sm space-y-1">
                          <div className="font-bold text-rose-700 dark:text-rose-400">
                            {vq.question}
                          </div>
                          <div className="opacity-95 pl-2 border-l-2 border-dashed border-red-500/20">
                            {vq.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5 MARKS QUESTIONS */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## 5 Marks Questions
                    </h3>
                    <div className="space-y-6">
                      {generatedNote.fiveMarksQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-rose-400/20 bg-rose-500/5 space-y-3">
                          <div className="font-bold text-lg text-rose-800 dark:text-rose-300">
                            {q.question}
                          </div>
                          <div>
                            <span className="font-bold">Answer:</span> {q.answer}
                          </div>
                          
                          {q.importantPoints && q.importantPoints.length > 0 && (
                            <div className="pl-3 border-l-2 border-red-500/20 space-y-1">
                              <span className="font-bold text-xs uppercase tracking-wider text-rose-500">Key Points:</span>
                              <ul className="space-y-1 list-disc pl-4 text-xs">
                                {q.importantPoints.map((pt, pIdx) => (
                                  <li key={pIdx}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {q.diagram && (
                            <div className="space-y-1">
                              <span className="font-bold text-xs uppercase tracking-wider text-rose-500">Required Diagram:</span>
                              <pre className="font-mono text-xs leading-relaxed p-3 rounded-lg overflow-x-auto whitespace-pre bg-black/5 dark:bg-white/5 border border-dashed border-red-500/20 shadow-inner">
                                {q.diagram}
                              </pre>
                            </div>
                          )}

                          {q.flowchart && (
                            <div className="space-y-1">
                              <span className="font-bold text-xs uppercase tracking-wider text-rose-500">Required Flowchart:</span>
                              <pre className="font-mono text-xs leading-relaxed p-3 rounded-lg overflow-x-auto whitespace-pre bg-black/5 dark:bg-white/5 border border-dashed border-cyan-500/20 shadow-inner">
                                {q.flowchart}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 10 MARKS QUESTIONS */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## 10 Marks Questions
                    </h3>
                    <div className="space-y-8">
                      {generatedNote.tenMarksQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-rose-400/30 bg-rose-500/5 space-y-4 text-justify">
                          <div className="font-bold text-lg text-rose-800 dark:text-rose-300">
                            {q.question}
                          </div>
                          <div>
                            <span className="font-bold block mb-1">Detailed Answer:</span> 
                            <p className="opacity-95">{q.detailedAnswer}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 border-rose-500/50 space-y-1 text-xs">
                            <span className="font-bold text-rose-500 uppercase">Step-by-step Explanation:</span>
                            <div className="whitespace-pre-line opacity-90">{q.stepByStepExplanation}</div>
                          </div>
                          
                          {q.importantExamPoints && q.importantExamPoints.length > 0 && (
                            <div className="pl-3 border-l-2 border-red-500/20 space-y-1">
                              <span className="font-bold text-xs uppercase tracking-wider text-rose-500">Important Exam Points:</span>
                              <ul className="space-y-1 list-disc pl-4 text-xs">
                                {q.importantExamPoints.map((pt, pIdx) => (
                                  <li key={pIdx}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {q.diagram && (
                            <div className="space-y-1">
                              <span className="font-bold text-xs uppercase tracking-wider text-rose-500">Required Labelled Diagram:</span>
                              <pre className="font-mono text-xs leading-relaxed p-3 rounded-lg overflow-x-auto whitespace-pre bg-black/5 dark:bg-white/5 border border-dashed border-red-500/20 shadow-inner">
                                {q.diagram}
                              </pre>
                            </div>
                          )}

                          {q.flowchart && (
                            <div className="space-y-1">
                              <span className="font-bold text-xs uppercase tracking-wider text-rose-500">Operation Flowchart:</span>
                              <pre className="font-mono text-xs leading-relaxed p-3 rounded-lg overflow-x-auto whitespace-pre bg-black/5 dark:bg-white/5 border border-dashed border-cyan-500/20 shadow-inner">
                                {q.flowchart}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EXAM NOTES */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## Exam Notes
                    </h3>
                    <ul className="space-y-1.5 pl-2">
                      {generatedNote.examNotes.map((n, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-500 shrink-0 text-xs mt-1">🔥</span>
                          <span className="opacity-95 font-semibold text-rose-950 dark:text-rose-200">{n}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* SUMMARY CAPSULE */}
                  <div className="space-y-2 pt-4 border-t border-red-500/15">
                    <h3 className="text-lg font-bold underline text-rose-700 font-handwritten">
                      ## Summary
                    </h3>
                    <div className="p-4 rounded-xl bg-yellow-200/50 border border-yellow-400 text-slate-900 font-medium italic shadow-sm">
                      📝 {generatedNote.summary}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
