import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer

class TelemetryConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.keep_running = True
        # Start the background task to stream telemetry ticks
        self.stream_task = asyncio.create_task(self.stream_telemetry())

    async def disconnect(self, close_code):
        self.keep_running = False
        if hasattr(self, 'stream_task'):
            self.stream_task.cancel()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get("action")
            
            # Allow client to request specific machine telemetry or inject critical test states
            if action == "subscribe" and "machine_id" in data:
                self.machine_id = data["machine_id"]
        except Exception:
            pass

    async def stream_telemetry(self):
        tick = 0
        while self.keep_running:
            try:
                await asyncio.sleep(1.0)
                tick += 1

                # Generate dynamic fluctuating telemetry parameters
                temp_base = 72.0 + Math_fluc(tick, 0.5)
                vibe_base = 1.2 + Math_fluc(tick, 0.2)
                fuel_level = max(0.0, 78.4 - (tick * 0.005))
                
                # Check for mock anomaly triggers on specific ticks
                alert = None
                status = "operational"
                
                if tick % 15 == 0:
                    alert = {
                        "machine": "CAT 797F Mining Truck #01",
                        "site": "Peoria Assembly",
                        "mode": "Bearing Vibration Spike",
                        "severity": "warning",
                        "message": "AI Alert: Vibration Z-axis exceeds threshold (3.1 mm/s) on CAT-797F-PE01."
                    }
                    status = "warning"
                    vibe_base = 3.25

                payload = {
                    "type": "telemetry_update",
                    "tick": tick,
                    "machine_status": status,
                    "telemetry": {
                        "temp": round(temp_base, 1),
                        "rpm": int(1800 + random.uniform(-10, 10)),
                        "engineLoad": int(70 + random.uniform(-5, 5)),
                        "oilPressure": round(45.0 + random.uniform(-2, 2), 1),
                        "hydraulicPressure": round(38.0 + random.uniform(-1.5, 1.5), 1),
                        "batteryVoltage": round(12.6 + random.uniform(-0.1, 0.1), 2),
                        "fuelLevel": round(fuel_level, 2),
                        "coolantTemp": round(temp_base + 4.2, 1),
                        "humidity": int(45 + random.uniform(-2, 2)),
                        "vibeX": round(0.8 + random.uniform(-0.1, 0.1), 2),
                        "vibeY": round(1.1 + random.uniform(-0.1, 0.1), 2),
                        "vibeZ": round(vibe_base, 2)
                    }
                }

                if alert:
                    payload["alert"] = alert

                # Transmit WebSocket frame
                await self.send(text_data=json.dumps(payload))
            except asyncio.CancelledError:
                break
            except Exception:
                await asyncio.sleep(1.0)

def Math_fluc(tick, scale):
    import Math
    # Simple sine wave fluctuation
    import math
    return math.sin(tick * 0.1) * scale
