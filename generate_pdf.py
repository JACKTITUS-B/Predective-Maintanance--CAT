import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # We do not draw headers/footers on the title page (page 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#1c1917")) # stone-900
            self.drawString(54, 750, "CATERPILLAR CAT® PREDICTIVE MAINTENANCE PLATFORM")
            
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#78716c")) # stone-500
            self.drawRightString(558, 750, "TECHNICAL DOCUMENTATION")
            
            # Header line
            self.setStrokeColor(colors.HexColor("#e7e5e4")) # stone-200
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
            # Footer line
            self.line(54, 52, 558, 52)
            
            # Footer details
            self.drawString(54, 40, "© 2026 Caterpillar Inc. All Rights Reserved.")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 40, page_text)
            
        self.restoreState()

def build_pdf(filename="PROJECT_DOCUMENTATION.pdf"):
    # Target 0.75 in (54 pt) margins. Printable height: 792 - 108 = 684. Width: 612 - 108 = 504.
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )
    
    styles = getSampleStyleSheet()
    
    # Custom colors
    brand_yellow = colors.HexColor("#FFCD00")
    brand_dark = colors.HexColor("#1C1917")
    text_color = colors.HexColor("#292524")
    border_color = colors.HexColor("#e7e5e4")
    light_bg = colors.HexColor("#F9F8F6")
    
    # Modify existing styles to avoid conflicts
    styles['Normal'].textColor = text_color
    styles['Normal'].fontSize = 9.5
    styles['Normal'].leading = 14
    
    # Add new distinct custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=brand_dark,
        alignment=0,
        spaceAfter=10
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#44403c"),
        spaceAfter=30
    )
    
    h1_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=brand_dark,
        spaceBefore=15,
        spaceAfter=8,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'SubSectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#44403c"),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        spaceAfter=8
    )
    
    code_style = ParagraphStyle(
        'CodeStyleCustom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#7f1d1d"),
        backColor=light_bg,
        borderPadding=6,
        borderWidth=0.5,
        borderColor=border_color,
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    story = []
    
    # ================= TITLE PAGE =================
    story.append(Spacer(1, 100))
    # Caterpillar Brand Bar
    d = Table([[""]], colWidths=[504], rowHeights=[10])
    d.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), brand_yellow),
        ('PADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(d)
    story.append(Spacer(1, 20))
    
    story.append(Paragraph("CATERPILLAR CAT®", subtitle_style))
    story.append(Paragraph("Predictive Maintenance Platform", title_style))
    story.append(Paragraph("Technical Design & System Architecture Documentation", subtitle_style))
    story.append(Spacer(1, 150))
    
    meta_data = [
        [Paragraph("<b>Status:</b> Ready for Deploy", body_style)],
        [Paragraph("<b>Version:</b> 1.0.0 (Enterprise Spec)", body_style)],
        [Paragraph("<b>Date:</b> July 2026", body_style)],
        [Paragraph("<b>Author:</b> Caterpillar Hackathon Development Team", body_style)]
    ]
    t_meta = Table(meta_data, colWidths=[300])
    t_meta.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_meta)
    
    story.append(PageBreak())
    
    # ================= 1. PROJECT OVERVIEW =================
    story.append(Paragraph("1. PROJECT OVERVIEW", h1_style))
    
    overview_text = (
        "The <b>Caterpillar CAT® Predictive Maintenance Platform</b> is an enterprise-grade "
        "Industrial Internet of Things (IIoT) analytics and fleet monitoring system. It provides site "
        "supervisors, maintenance engineers, service teams, and executives with real-time insight into the "
        "health, status, and telemetry profile of heavy machinery across globally distributed sites."
    )
    story.append(Paragraph(overview_text, body_style))
    
    story.append(Paragraph("<b>1.1 Business Problem Solved</b>", h2_style))
    biz_text = (
        "Heavy machinery downtime represents one of the single largest losses in the mining, construction, "
        "and agricultural sectors. Unscheduled breakdowns result in direct revenue losses when processes halt, "
        "safety hazards to machinery operators, high emergency transport and parts replacement costs, "
        "and shortened overall lifespans of million-dollar equipment assets due to compounding faults."
    )
    story.append(Paragraph(biz_text, body_style))

    story.append(Paragraph("<b>1.2 Objective & Importance</b>", h2_style))
    obj_text = (
        "By utilizing real-time sensor streams and automated machine learning, this platform transitions "
        "operations from reactive maintenance (fixing on failure) or scheduled maintenance (fixing on cycles "
        "regardless of wear) to data-driven predictive maintenance. This maximizes availability and saves "
        "hundreds of thousands of dollars in operational overhead."
    )
    story.append(Paragraph(obj_text, body_style))
    
    story.append(Paragraph("<b>1.3 Key Personas</b>", h2_style))
    story.append(Paragraph("• <b>Super Admin</b>: Fleet directors coordinating cross-facility health metrics.", bullet_style))
    story.append(Paragraph("• <b>Site Manager</b>: Local operations managers tracking active hardware status.", bullet_style))
    story.append(Paragraph("• <b>Maintenance Engineer</b>: Technicians resolving automated repair tickets.", bullet_style))
    story.append(Paragraph("• <b>Service Team Member</b>: Support staff logging parts replacements and oil levels.", bullet_style))
    story.append(Paragraph("• <b>Operator</b>: Machinery drivers receiving warning readouts on operational consoles.", bullet_style))
    story.append(Spacer(1, 10))

    # ================= 2. TECHNOLOGY STACK =================
    story.append(Paragraph("2. TECHNOLOGY STACK", h1_style))
    
    tech_data = [
        ["Technology", "Responsibility", "Key Advantage"],
        ["Next.js (v16)", "Frontend App Shell & Routing", "Fast Edge pre-renders, robust static compilation"],
        ["React", "User Interface Elements", "Stateful components, virtual DOM reconciliation"],
        ["TypeScript", "Type Safety", "Compile-time validation, self-documenting code"],
        ["Tailwind CSS", "Enterprise Styling Theme", "Utility classes, warm stone/yellow branding system"],
        ["Django", "REST API Backend & Core ORM", "Secure authentication, simple migrations, relational logic"],
        ["FastAPI", "AI Evaluation Microservice", "Asynchronous Python, lightweight memory usage"],
        ["Neon Postgres", "SQL Database Layer", "Serverless auto-scaling, instant schema branching"],
        ["SimpleJWT", "User Authentication", "Stateless JSON Web Tokens for API authorization"]
    ]
    t_tech = Table(tech_data, colWidths=[100, 200, 204])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), brand_dark),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 15))

    # ================= 3. SYSTEM ARCHITECTURE =================
    story.append(Paragraph("3. SYSTEM ARCHITECTURE", h1_style))
    
    arch_text = (
        "The platform relies on a decoupled microservices setup designed for high-availability. "
        "High-frequency sensor writes are fully separated from user interaction requests. "
        "Below is the data communication flow:"
    )
    story.append(Paragraph(arch_text, body_style))
    
    flow_steps = (
        "<b>1. Browser Client</b> &rarr; Queries Next.js UI.<br/>"
        "<b>2. Django API</b> &rarr; Handles JWT authentication, site definitions, and maintenance scheduling.<br/>"
        "<b>3. FastAPI Engine</b> &rarr; Performs Z-score anomaly sweeps and models failure probabilities.<br/>"
        "<b>4. Neon DB</b> &rarr; Serves as the central repository with time-series partitioned telemetry tables."
    )
    story.append(Paragraph(flow_steps, code_style))
    
    # ================= 4. PROJECT FOLDER STRUCTURE =================
    story.append(Paragraph("4. PROJECT FOLDER STRUCTURE", h1_style))
    
    folder_data = [
        ["Folder", "Contents & Purpose"],
        ["/frontend", "Next.js App Router, components/layout navigators, UI primitives (Stone & Yellow themes)."],
        ["/backend", "Django REST Framework Web Core. Includes apps users, machinery, telemetry, maintenance."],
        ["/ai-service", "FastAPI microservice executing numpy risk coefficients computations and predictions writes."],
        ["/simulator", "Python CLI daemon continuously feeding 105 machines' active metrics to PostgreSQL."]
    ]
    t_folder = Table(folder_data, colWidths=[100, 404])
    t_folder.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#44403c")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_folder)
    story.append(Spacer(1, 15))

    # ================= 5. KEY MODULES & DATABASE SCHEMA =================
    story.append(Paragraph("5. KEY MODULES & DATABASE SCHEMA", h1_style))
    
    db_text = (
        "The system database schema is normalized to 3NF and optimized using PostgreSQL partitioning. "
        "Key tables include:"
    )
    story.append(Paragraph(db_text, body_style))
    
    story.append(Paragraph("• <b>users</b>: Stores credentials and role IDs using cryptographically hashed values.", bullet_style))
    story.append(Paragraph("• <b>machines</b>: Relational asset profile tracking statuses (operational, warning, critical).", bullet_style))
    story.append(Paragraph("• <b>sensor_data</b>: Large-scale table partitioned by timestamp, saving temperature, vibration, and pressure logs.", bullet_style))
    story.append(Paragraph("• <b>predictions</b>: AI prediction registry storing calculated anomalies and RUL bounds.", bullet_style))
    story.append(Paragraph("• <b>maintenance_history</b>: Work order registry mapping task descriptions, technicians, costs, and statuses.", bullet_style))
    story.append(Spacer(1, 10))

    # ================= 6. THE CONSOLIDATED MAINTENANCE WORKFLOW =================
    story.append(Paragraph("6. MAINTENANCE RESOLUTION WORKFLOW", h1_style))
    
    flow_text = (
        "The maintenance lifecycle provides automated coordination between sensor anomalies and active work orders:"
    )
    story.append(Paragraph(flow_text, body_style))
    
    story.append(Paragraph("1. <b>Anomaly Ingestion</b>: Sensor Simulator writes telemetry batches to Neon Postgres.", bullet_style))
    story.append(Paragraph("2. <b>AI Evaluation</b>: FastAPI identifies a sensor outlier (Z-Score > 2.5) and writes a prediction.", bullet_style))
    story.append(Paragraph("3. <b>Alert Triggered</b>: Django captures the prediction and issues an alarm notification.", bullet_style))
    story.append(Paragraph("4. <b>Task Scheduled</b>: An active ticket is generated in the <i>maintenance_history</i> registry.", bullet_style))
    story.append(Paragraph("5. <b>Work Order Complete</b>: The technician views the 'In Progress' tab, completes repairs, and updates the task state to completed. The machine's status returns to operational and the card moves to 'Complete'.", bullet_style))

    # ================= 7. CONSOLIDATED MAINTENANCE WIDGET =================
    story.append(Paragraph("7. THE MAINTENANCE INTERACTION PORTAL", h1_style))
    
    widget_text = (
        "The bottom row of the Super Admin Dashboard features a single, optimized <b>MAINTENANCE</b> tabbed card. "
        "This widget incorporates:"
    )
    story.append(Paragraph(widget_text, body_style))
    
    story.append(Paragraph("• <b>Complete / In Progress Tabs</b>: Allows instant navigation between work lists without site refreshes.", bullet_style))
    story.append(Paragraph("• <b>Search by Machine Code</b>: React-filtered search checking machine signatures (e.g. CAT797F) ignoring whitespace and casing.", bullet_style))
    story.append(Paragraph("• <b>Cost Sort Selection</b>: Dynamically sorts list items numerically by cost in Low to High or High to Low order.", bullet_style))
    story.append(Paragraph("• <b>Date Sort Selection</b>: Reorders records by recently updated date metrics.", bullet_style))
    story.append(Spacer(1, 10))
    
    # ================= FUTURE ENHANCEMENTS =================
    story.append(Paragraph("8. FUTURE ENHANCEMENTS", h1_style))
    story.append(Paragraph("• <b>Apache Kafka Ingestion</b>: Route sensor messages to Kafka queues to scale telemetry handling.", bullet_style))
    story.append(Paragraph("• <b>Redis Caching</b>: Cache calculated machine health indicators to handle massive concurrent REST hits.", bullet_style))
    story.append(Paragraph("• <b>IoT Hub Edge Calculators</b>: Evaluate simple anomalies on local machine microcontrollers.", bullet_style))
    
    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == "__main__":
    build_pdf()
    print("PDF build complete!")
