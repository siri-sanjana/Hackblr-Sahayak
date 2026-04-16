import Vapi from "@vapi-ai/web";

let vapiInstance: InstanceType<typeof Vapi> | null = null;

export function getVapiClient(): InstanceType<typeof Vapi> {
  if (!vapiInstance) {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
    
    console.log("🛠️ Vapi Client Initialization");
    console.log("🔍 Reading NEXT_PUBLIC_VAPI_PUBLIC_KEY:", publicKey ? `(Set: ...${publicKey.slice(-4)})` : "MISSING ❌");
    
    if (!publicKey || publicKey === "your_vapi_public_key_here") {
      console.warn("⚠️  NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set. Voice calls will not work.");
    }
    vapiInstance = new Vapi(publicKey);
  }
  return vapiInstance;
}
