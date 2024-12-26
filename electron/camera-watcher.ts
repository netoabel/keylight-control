import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";
import * as camera from "camera-watch";
import { KeylightManager } from "./keylight-manager";

const RETRY_INTERVAL_MS = 5000;
const WORKER_CONCURRENCY = 1;
const MAX_RETRIES = 10;

let keylightManager: KeylightManager;

type Command = {
  action: Function;
};

const cmdQueue: queueAsPromised<Command> = fastq.promise(onCommand, WORKER_CONCURRENCY);

async function onCommand(cmd: Command, retryCount: number = 0): Promise<void> {
  cmdQueue.pause();
  try {
    await cmd.action();
    cmdQueue.resume();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error executing command: ${message}`);
    if (retryCount < MAX_RETRIES) {
      console.log(
        `Retrying (${retryCount + 1}) in ${RETRY_INTERVAL_MS}ms. Queue size: ${cmdQueue.length()}`
      );
      setTimeout(() => onCommand(cmd, retryCount + 1), RETRY_INTERVAL_MS);
    } else {
      cmdQueue.resume();
    }
  }
}

function updateKeylightState(newState: string): void {
  if (!keylightManager.isAutoModeEnabled()) return;

  run({
    action: async () => {
      await (newState === "On" ? keylightManager.turnOn() : keylightManager.turnOff());
    },
  });
}

export function start(manager: KeylightManager) {
  keylightManager = manager;
  camera.watch({
    onChange: updateKeylightState,
    onError: (error) => console.error(error),
  });
}

function run(command: Command) {
  cmdQueue.push(command);
}

export { run };
