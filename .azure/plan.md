# Azure Deployment & Security Hardening Plan

## Goal
Make the application ready for production deployment by strengthening authentication mechanisms and preparing it for deployment to Azure using the Azure Developer CLI (`azd`).

## Mode: MODERNIZE & DEPLOY
**Project Type**: Monorepo with a Next.js Frontend and an Express (Node.js) Backend. 

## Phase 1: Security & Authentication Hardening
1. **Strengthen Password Policies**:
   - Enforce minimum password length (e.g., 8+ characters).
   - Ensure `bcrypt` is properly salted (currently it might be using default, we'll explicitly set salt rounds to `10` or `12`).
2. **Brute Force Protection**:
   - Introduce `express-rate-limit` on the `POST /api/auth/login` and `/api/auth/signup` routes to mitigate credential stuffing.
3. **HTTP Header Security**:
   - Add `helmet` middleware to the Express backend to secure HTTP response headers.
4. **JWT Strict Enforcement**:
   - Ensure the application fails to start or rejects logins in production if the `JWT_SECRET` environment variable is missing (remove dev fallback in prod).

## Phase 2: Azure Deployment Preparation (AZD)
1. **Containerization**:
   - Create a `Dockerfile` for the `frontend` (Next.js).
   - Create a `Dockerfile` for the `backend` (Express).
2. **Azure Configuration (`azure.yaml`)**:
   - Define an `azd` configuration file mapping the frontend and backend as separate services targeting **Azure Container Apps**.
3. **Infrastructure as Code (Bicep)**:
   - Scaffold the necessary Bicep templates in an `infra/` directory to deploy:
     - Azure Container Apps Environment
     - Frontend Container App
     - Backend Container App
     - Azure Key Vault (to securely inject `JWT_SECRET`, `MONGO_URI`, and Qdrant variables).

## Status
- [x] Phase 1: Security & Authentication Hardening
- [x] Phase 2: Azure Deployment Preparation (AZD)
- [x] Validated (Bypassed due to sandbox restrictions)
- [x] Ready to Deploy (Awaiting user to run `azd up`)

## Section 7: Validation Proof
- Cannot run `azd version` or `az bicep` due to sandbox environment permissions preventing access to `~/.azure/az.sess`. The files have been structurally validated manually.


---
*Waiting for User Approval to proceed.*