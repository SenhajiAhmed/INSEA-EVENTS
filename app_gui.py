import sys
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QLineEdit, QPushButton, QMessageBox, QFrame, QGraphicsDropShadowEffect
)
from PyQt5.QtCore import Qt, QThread, pyqtSignal
from PyQt5.QtGui import QFont, QPixmap, QPainter, QBrush, QPen, QColor, QIcon
from gui_config.scraper_main import lancer_scraping

class ScraperThread(QThread):
    finished = pyqtSignal()
    error = pyqtSignal(str)

    def __init__(self, keyword, key):
        super().__init__()
        self.keyword = keyword
        self.key = key

    def run(self):
        try:
            lancer_scraping(self.keyword, self.key)
            self.finished.emit()
        except Exception as e:
            self.error.emit(str(e))


class ScraperApp(QWidget):
    def __init__(self):
        super().__init__()
        self.init_ui()
        self.scraper_thread = 3

    def center_on_screen(self):
        frame_geometry = self.frameGeometry()
        screen = QApplication.desktop().screenNumber(QApplication.desktop().cursor().pos())
        center_point = QApplication.desktop().screenGeometry(screen).center()
        frame_geometry.moveCenter(center_point)
        self.move(frame_geometry.topLeft())


    def init_ui(self):
        self.setWindowTitle("INSEA x Events - Scraper")
        self.resize(600, 800)
        self.setFixedSize(600, 800)  # empêche le redimensionnement
        self.center_on_screen()


        self.setStyleSheet("""
            QWidget {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #0f2027, stop:0.5 #203a43, stop:1 #2c5364);
                color: white;
                font-family: 'Segoe UI', sans-serif;
            }
        """)

        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(30, 20, 30, 30)
        main_layout.setSpacing(20)

        self.create_header(main_layout)
        main_layout.addWidget(self.create_card_frame())
        self.create_footer(main_layout)

        self.setLayout(main_layout)

    def create_header(self, layout):
        header_layout = QHBoxLayout()

        def load_logo(path):
            label = QLabel()
            pixmap = QPixmap(path)
            if not pixmap.isNull():
                pixmap = pixmap.scaled(80, 80, Qt.KeepAspectRatio, Qt.SmoothTransformation)
                label.setPixmap(pixmap)
            label.setStyleSheet("background: transparent; border: none;")
            return label

        insea_logo = load_logo("logos/INSEA_logo.png")
        events_logo = load_logo("logos/LOGO_EVENTS.png")

        title = QLabel("INSEA x Events - Scraper")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 28px;
                font-weight: 600;
                background: none;
            }
        """)

        header_layout.addWidget(insea_logo)
        header_layout.addStretch()
        header_layout.addWidget(title)
        header_layout.addStretch()
        header_layout.addWidget(events_logo)

        layout.addLayout(header_layout)

    def create_card_frame(self):
        card_frame = QFrame()
        card_frame.setStyleSheet("""
            QFrame {
                background-color: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 20px;
                padding: 25px;
            }
        """)

        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(40)
        shadow.setColor(QColor(0, 0, 0, 100))
        shadow.setOffset(0, 10)
        card_frame.setGraphicsEffect(shadow)

        layout = QVBoxLayout(card_frame)
        layout.setSpacing(20)

        title = QLabel("Service Discovery Engine 🔍")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("""
            QLabel {
                font-size: 22px;
                font-weight: bold;
                color: white;
                background: none;
            }
        """)

        description = QLabel("Entrez un service à rechercher pour extraire les données des entreprises")
        description.setWordWrap(True)
        description.setAlignment(Qt.AlignCenter)
        description.setStyleSheet("""
            QLabel {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
                background: none;
            }
        """)

        self.input = QLineEdit()
        self.input.setPlaceholderText("Ex: traiteur, restaurant, coiffeur...")
        self.input.setStyleSheet("""
            QLineEdit {
                background: rgba(255, 255, 255, 0.85);
                color: #222;
                border: 2px solid transparent;
                border-radius: 12px;
                padding: 14px 20px;
                font-size: 16px;
            }
            QLineEdit:focus {
                border: 2px solid #3ecf8e;
                background: white;
            }
            QLineEdit::placeholder {
                color: #666;
            }
        """)

        self.button = QPushButton("🚀 Lancer le scraping")
        self.button.clicked.connect(self.run_scraper)
        self.button.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #3ecf8e, stop:1 #2cc47f);
                color: white;
                font-size: 16px;
                font-weight: bold;
                padding: 14px;
                border: none;
                border-radius: 12px;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #2cc47f, stop:1 #3ecf8e);
            }
            QPushButton:pressed {
                background: #29b070;
            }
            QPushButton:disabled {
                background: #666;
                color: #aaa;
            }
        """)

        self.status_label = QLabel("")
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setStyleSheet("""
            QLabel {
                color: #3ecf8e;
                font-weight: bold;
                font-size: 14px;
                background: none;
            }
        """)

        layout.addWidget(title)
        layout.addWidget(description)
        layout.addWidget(self.input)
        layout.addWidget(self.button)
        layout.addWidget(self.status_label)

        return card_frame

    def create_footer(self, layout):
        footer = QLabel("Unite, celebrate, inspire ✨")
        footer.setAlignment(Qt.AlignCenter)
        footer.setStyleSheet("""
            QLabel {
                color: rgba(255, 255, 255, 0.5);
                font-size: 12px;
                font-style: italic;
                background: none;
                margin-top: 20px;
            }
        """)
        layout.addWidget(footer)


    def run_scraper(self):
        keyword = self.input.text().strip()
        key = keyword.replace(" ", "_").lower()  # ➕ clé propre

        if not keyword:
            self.show_message("Erreur", "Veuillez entrer un mot-clé.", "warning")
            return

        self.button.setEnabled(False)
        self.button.setText("⏳ Scraping en cours...")
        self.status_label.setText("Extraction des données en cours...")

        # ➕ Passe keyword ET key au thread
        self.scraper_thread = ScraperThread(keyword, key)
        self.scraper_thread.finished.connect(self.on_scraping_finished)
        self.scraper_thread.error.connect(self.on_scraping_error)
        self.scraper_thread.start()


    def on_scraping_finished(self):
        self.button.setEnabled(True)
        self.button.setText("🚀 Lancer le scraping")
        self.status_label.setText("✅ Scraping terminé avec succès!")
        self.show_message("Succès", f"Scraping terminé pour '{self.input.text()}'", "success")

    def on_scraping_error(self, error_msg):
        self.button.setEnabled(True)
        self.button.setText("🚀 Lancer le scraping")
        self.status_label.setText("❌ Erreur lors du scraping")
        self.show_message("Erreur", error_msg, "error")

    def show_message(self, title, message, msg_type):
        msg_box = QMessageBox(self)
        msg_box.setWindowTitle(title)
        msg_box.setText(message)
        
        # Style de la message box
        msg_box.setStyleSheet("""
            QMessageBox {
                background: #2a2a40;
                color: white;
            }
            QMessageBox QPushButton {
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 15px;
                font-weight: bold;
            }
            QMessageBox QPushButton:hover {
                background: #45a049;
            }
        """)
        
        if msg_type == "success":
            msg_box.setIcon(QMessageBox.Information)
        elif msg_type == "warning":
            msg_box.setIcon(QMessageBox.Warning)
        else:
            msg_box.setIcon(QMessageBox.Critical)
        
        msg_box.exec_()

    def closeEvent(self, event):
        if self.scraper_thread and self.scraper_thread.isRunning():
            reply = QMessageBox.question(self, 'Fermeture', 
                                       'Un scraping est en cours. Voulez-vous vraiment fermer?',
                                       QMessageBox.Yes | QMessageBox.No, 
                                       QMessageBox.No)
            
            if reply == QMessageBox.Yes:
                self.scraper_thread.terminate()
                event.accept()
            else:
                event.ignore()
        else:
            event.accept()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle('Fusion')  # Style moderne
    
    window = ScraperApp()
    window.show()
    
    sys.exit(app.exec_())