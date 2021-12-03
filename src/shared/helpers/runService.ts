import {RunService} from "@rbxts/services";

import {isDebug} from "./attribute";
import {CleanupFuncType} from "./clean";

/**
 * Keep running function at every frame
 */
export function onHearbeat(name: string, heartbeatFunc: (dt: number) => void): CleanupFuncType {
  if (isDebug) print("HEARTBEAT", name, "INIT");
  const connection = RunService.Heartbeat.Connect(heartbeatFunc);
  return () => {
    if (isDebug) print("HEARTBEAT", name, "DEINIT");
    if (connection) {
      connection.Disconnect();
    }
  };
}

/**
 * Keep running function at every render step
 */
export function onRenderStepped(
  name: string,
  heartbeatFunc: (dt: number) => void
): CleanupFuncType {
  if (isDebug) print("RENDERSTEPPED", name, "INIT");
  const connection = RunService.RenderStepped.Connect(heartbeatFunc);
  return () => {
    if (isDebug) print("RENDEWRSTEPPED", name, "DEINIT");
    if (connection) {
      connection.Disconnect();
    }
  };
}

/**
 * Keep running function at every physics step
 */
export function onStepped(
  name: string,
  heartbeatFunc: (time: number, dt: number) => void
): CleanupFuncType {
  if (isDebug) print("STEPPED", name, "INIT");
  const connection = RunService.Stepped.Connect(heartbeatFunc);
  return () => {
    if (isDebug) print("STEPPED", name, "DEINIT");
    if (connection) {
      connection.Disconnect();
    }
  };
}

/**
 * Keep running function at specified interval if not already running
 */
export function onInterval(
  name: string,
  interval: number,
  intervalFunc: (elapsed?: number) => void
): CleanupFuncType {
  let running = false;
  let currentTick = 0;
  let nextTick = interval;
  if (isDebug) print("INTERVAL", name, "INIT");
  const connection = RunService.Heartbeat.Connect((dt) => {
    currentTick += dt;
    if (currentTick > nextTick) {
      nextTick += interval;
      if (!running) {
        if (isDebug) print("INTERVAL", name, "RUNNING");
        running = true;
        intervalFunc(currentTick);
        running = false;
      }
    }
  });
  return () => {
    if (isDebug) print("INTERVAL", name, "DEINIT");
    if (connection) {
      connection.Disconnect();
    }
  };
}

/**
 * Run function and keep running function at specified interval if not already running
 */
export function onIntervalInit(
  name: string,
  interval: number,
  intervalFunc: (elapsed?: number) => void
): CleanupFuncType {
  if (isDebug) print("INTERVAL", name, "RUNNING");
  intervalFunc(0);
  return onInterval(name, interval, intervalFunc);
}
