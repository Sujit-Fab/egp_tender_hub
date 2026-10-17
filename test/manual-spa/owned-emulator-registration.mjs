// Never unregister an emulator owned by another session, including after a
// failed or partial startup attempt.
export function clearOwnedEmulatorRegistration(registry, instance) {
  if (registry.get(instance.getName()) === instance) registry.clear(instance.getName());
}
