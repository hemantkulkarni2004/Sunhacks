# CityPulse — Officials Dashboard (Single File)
# -------------------------------------------------
# Run:  python citypulse_officials_dashboard_single_file.py
# Deps: pip install kivy requests
# Backend expected at BASE_URL with endpoints:
#   POST   /auth/login           -> { token, role }
#   GET    /projects             -> [ {id,title,location,status,congestion_level,hazard_type,description}, ... ]
#   GET    /reports              -> [ {id,user_id,type,location,description,timestamp,status}, ... ]
#   PUT    /reports/update/<id>  -> { msg: "updated" }

from kivy.app import App
from kivy.clock import Clock
from kivy.core.window import Window
from kivy.lang import Builder
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.spinner import Spinner
from kivy.uix.scrollview import ScrollView
from threading import Thread
import requests

# -----------------------------
# Config
# -----------------------------
BASE_URL = "http://127.0.0.1:5000"  # change if your backend runs elsewhere
Window.size = (1100, 700)

# -----------------------------
# KV UI (one string)
# -----------------------------
KV = """
#:import dp kivy.metrics.dp

<RootManager>:
    LoginScreen:
        name: "login"
    DashboardScreen:
        name: "dashboard"
    ProjectsScreen:
        name: "projects"
    ReportsScreen:
        name: "reports"

<LoginScreen>:
    BoxLayout:
        orientation: "vertical"
        padding: dp(24)
        spacing: dp(12)

        Label:
            text: "CityPulse — Officials Login"
            font_size: "24sp"
            size_hint_y: None
            height: dp(44)

        TextInput:
            id: email_input
            hint_text: "Official Email"
            multiline: False
            size_hint_y: None
            height: dp(44)

        TextInput:
            id: password_input
            hint_text: "Password"
            password: True
            multiline: False
            size_hint_y: None
            height: dp(44)

        Button:
            text: "Login"
            size_hint_y: None
            height: dp(44)
            on_release: root.do_login(email_input.text, password_input.text)

        Label:
            id: status_label
            text: ""
            color: 1,0,0,1
            size_hint_y: None
            height: dp(22)

<DashboardScreen>:
    BoxLayout:
        orientation: "vertical"
        padding: dp(20)
        spacing: dp(12)

        Label:
            id: welcome_label
            text: "Welcome"
            font_size: "22sp"
            size_hint_y: None
            height: dp(44)

        BoxLayout:
            size_hint_y: None
            height: dp(48)
            spacing: dp(10)
            Button:
                text: "Projects"
                on_release: root.manager.current = "projects"
            Button:
                text: "Reports"
                on_release: root.manager.current = "reports"
            Button:
                text: "Logout"
                on_release: root.do_logout()

<ProjectsScreen>:
    BoxLayout:
        orientation: "vertical"
        padding: dp(14)
        spacing: dp(10)

        BoxLayout:
            size_hint_y: None
            height: dp(36)
            Label:
                id: status_label
                text: ""
                halign: "left"
                valign: "middle"

        ScrollView:
            bar_width: dp(8)
            do_scroll_x: False
            GridLayout:
                id: projects_container
                cols: 1
                size_hint_y: None
                height: self.minimum_height
                row_default_height: dp(110)
                row_force_default: False
                spacing: dp(8)

<ReportsScreen>:
    BoxLayout:
        orientation: "vertical"
        padding: dp(14)
        spacing: dp(10)

        BoxLayout:
            size_hint_y: None
            height: dp(36)
            Label:
                id: status_label
                text: ""
                halign: "left"
                valign: "middle"

        ScrollView:
            bar_width: dp(8)
            do_scroll_x: False
            GridLayout:
                id: reports_container
                cols: 1
                size_hint_y: None
                height: self.minimum_height
                row_default_height: dp(150)
                row_force_default: False
                spacing: dp(10)
"""

# -----------------------------
# API helpers (inline)
# -----------------------------

def _auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"} if token else {}


def api_login(email: str, password: str) -> dict:
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password}, timeout=10)
        return r.json()
    except Exception as e:
        return {"error": str(e)}


def api_projects(token: str) -> dict:
    try:
        r = requests.get(f"{BASE_URL}/projects", headers=_auth_headers(token), timeout=10)
        return r.json()
    except Exception as e:
        return {"error": str(e)}


def api_reports(token: str) -> dict:
    try:
        r = requests.get(f"{BASE_URL}/reports", headers=_auth_headers(token), timeout=10)
        return r.json()
    except Exception as e:
        return {"error": str(e)}


def api_update_report_status(token: str, report_id: int, new_status: str) -> dict:
    try:
        r = requests.put(
            f"{BASE_URL}/reports/update/{report_id}",
            json={"status": new_status},
            headers=_auth_headers(token),
            timeout=10,
        )
        return r.json()
    except Exception as e:
        return {"error": str(e)}

# -----------------------------
# Screens
# -----------------------------
class RootManager(ScreenManager):
    pass


class LoginScreen(Screen):
    def do_login(self, email: str, password: str):
        email = (email or "").strip()
        password = (password or "").strip()
        self.ids.status_label.text = "Signing in…"
        if not email or not password:
            self.ids.status_label.text = "Email & password are required"
            return

        def work():
            resp = api_login(email, password)
            Clock.schedule_once(lambda dt: self._after_login(resp))

        Thread(target=work, daemon=True).start()

    def _after_login(self, resp: dict):
        if resp.get("error"):
            self.ids.status_label.text = f"Network error: {resp['error']}"
            return
        token = resp.get("token")
        role = resp.get("role")
        if token and role == "official":
            self.manager.auth_token = token
            self.manager.user_role = role
            self.manager.current = "dashboard"
            self.ids.status_label.text = ""
        else:
            msg = resp.get("msg") or "Invalid credentials / not an official"
            self.ids.status_label.text = msg


class DashboardScreen(Screen):
    def on_pre_enter(self, *args):
        self.ids.welcome_label.text = "Welcome, Official"

    def do_logout(self):
        # simple logout: drop token and return to login
        if hasattr(self.manager, 'auth_token'):
            delattr(self.manager, 'auth_token')
        self.manager.current = "login"


class ProjectsScreen(Screen):
    def on_pre_enter(self, *args):
        self.ids.projects_container.clear_widgets()
        self.ids.status_label.text = "Loading projects…"
        Thread(target=self._load, daemon=True).start()

    def _load(self):
        token = getattr(self.manager, 'auth_token', None)
        data = api_projects(token)
        Clock.schedule_once(lambda dt: self._render(data))

    def _render(self, data: dict):
        self.ids.projects_container.clear_widgets()
        if data.get('error'):
            self.ids.status_label.text = f"Error: {data['error']}"
            return

        items = data if isinstance(data, list) else data.get('projects', [])
        if not items:
            self.ids.status_label.text = "No projects found"
            return

        self.ids.status_label.text = f"Loaded {len(items)} project(s)"

        for p in items:
            self.ids.projects_container.add_widget(self._project_row(p))

    def _project_row(self, p: dict):
        row = BoxLayout(orientation='vertical', size_hint_y=None, height='110dp', padding=(10,10), spacing=4)
        title = p.get('title', 'Untitled')
        location = p.get('location', '-')
        status = p.get('status', '-')
        congestion = p.get('congestion_level', '-')
        hazard = p.get('hazard_type', '-')
        desc = p.get('description', '-')

        row.add_widget(Label(text=f"[b]{title}[/b]", markup=True, halign='left', valign='middle'))
        row.add_widget(Label(text=f"Location: {location} | Status: {status} | Congestion: {congestion} | Hazard: {hazard}", halign='left'))
        row.add_widget(Label(text=desc, halign='left'))
        return row


class ReportsScreen(Screen):
    def on_pre_enter(self, *args):
        self.ids.reports_container.clear_widgets()
        self.ids.status_label.text = "Loading reports…"
        Thread(target=self._load, daemon=True).start()

    def _load(self):
        token = getattr(self.manager, 'auth_token', None)
        data = api_reports(token)
        Clock.schedule_once(lambda dt: self._render(data))

    def _render(self, data: dict):
        self.ids.reports_container.clear_widgets()
        if data.get('error'):
            self.ids.status_label.text = f"Error: {data['error']}"
            return

        items = data if isinstance(data, list) else data.get('reports', [])
        if not items:
            self.ids.status_label.text = "No reports found"
            return

        self.ids.status_label.text = f"Loaded {len(items)} report(s)"

        for r in items:
            self.ids.reports_container.add_widget(self._report_row(r))

    def _report_row(self, r: dict):
        rid = r.get('id')
        box = BoxLayout(orientation='vertical', size_hint_y=None, height='150dp', padding=(10,10), spacing=6)
        header = Label(text=f"[b]{r.get('type','Issue')}[/b] • #{rid} • Status: {r.get('status','-')}", markup=True, halign='left')
        meta = Label(text=f"Location: {r.get('location','-')} | Time: {r.get('timestamp','-')}")
        desc = Label(text=r.get('description','-'), halign='left')

        controls = BoxLayout(size_hint_y=None, height='40dp', spacing=10)
        spinner = Spinner(text=r.get('status','pending'), values=('pending','resolved'), size_hint=(None, None), size=('160dp','36dp'))
        btn = Button(text='Update Status', size_hint=(None, None), size=('160dp','36dp'))
        btn.bind(on_release=lambda _btn, rrid=rid, sp=spinner: self._do_update(rrid, sp.text))

        controls.add_widget(spinner)
        controls.add_widget(btn)

        box.add_widget(header)
        box.add_widget(meta)
        box.add_widget(desc)
        box.add_widget(controls)
        return box

    def _do_update(self, report_id: int, new_status: str):
        self.ids.status_label.text = f"Updating report #{report_id}…"
        def work():
            token = getattr(self.manager, 'auth_token', None)
            resp = api_update_report_status(token, report_id, new_status)
            Clock.schedule_once(lambda dt: self._after_update(resp))
        Thread(target=work, daemon=True).start()

    def _after_update(self, resp: dict):
        if resp.get('error'):
            self.ids.status_label.text = f"Error: {resp['error']}"
        else:
            self.ids.status_label.text = "Updated. Refreshing…"
            # reload list
            self.on_pre_enter()

# -----------------------------
# App
# -----------------------------
class CityPulseOfficialApp(App):
    title = "CityPulse — Officials Dashboard"

    def build(self):
        Builder.load_string(KV)
        return RootManager()


if __name__ == "__main__":
    CityPulseOfficialApp().run()
