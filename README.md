<div align="center">

# 🥗 Fridge AI Expiry Guardian

### *An AI-Powered Smart Food Expiry & Inventory Management System*

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Engine-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br />

<p align="center">
  <a href="#-demo--preview">View Demo</a> •
  <a href="#-architecture--data-flow">Architecture</a> •
  <a href="#-features">Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Project Structure</a>
</p>

---

</div>

## 📖 Overview

**Fridge AI Expiry Guardian** is an intelligent food inventory and waste-reduction platform designed to solve modern household food management challenges. Instead of tracking expiry dates manually, users can add items using natural language, allowing **Google Gemini AI** to extract structured metadata, predict real-world shelf lives, and send proactive notifications.

By combining modern frontend architectures, robust backend infrastructure, and AI reasoning, the platform serves as a smart digital refrigerator assistant that suggests recipes, answers natural language queries about your inventory, and minimizes overall household food waste.

---

## 🎥 Demo & Preview

> 💡 **Tip**: Replace placeholder media links below with your actual project assets (GIFs/Images) to show off your UI!

<div align="center">

| **Dashboard Overview** | **AI Natural Language Input** |
| :---: | :---: |
| ![Dashboard Preview](https://via.placeholder.com/600x350/1e1e2e/ffffff?text=Dashboard+UI+Preview) | ![Natural Language Input](https://via.placeholder.com/600x350/1e1e2e/ffffff?text=AI+Natural+Language+Input) |

| **Smart Recipe Suggestions** | **Interactive Inventory & Alerts** |
| :---: | :---: |
| ![Recipe Recommendation](https://via.placeholder.com/600x350/1e1e2e/ffffff?text=AI+Recipe+Generator) | ![Notifications UI](https://via.placeholder.com/600x350/1e1e2e/ffffff?text=Smart+Expiry+Notifications) |

</div>

---

## ✨ Key Features

### 🥬 Smart Inventory Management
* **CRUD Operations**: Effortlessly add, edit, or delete items from your digital fridge.
* **Auto-Status Calculation**: Dynamically tracks shelf life based on open dates, printed expiry, and AI predictions.
* **Category Organization**: Categorizes items into Dairy, Produce, Meats, Beverages, Snacks, and Pantry goods.

### 🤖 AI Natural Language Processing
* Type raw text like: `2 Liters Milk, 12 Eggs, 3 Tomatoes, 1 block Cheddar Cheese`.
* Gemini AI automatically parses individual items, calculates estimated quantities, assigns standard categories, and maps initial shelf-life expectations.

### 📅 AI Expiry Prediction System
* Monitors 3 distinct date metrics per item: **Open Date**, **Printed Expiry**, and **AI Predicted Expiry**.
* Continuously assigns a real-time status tier:
  * 🟢 **Fresh**: Plenty of shelf life remaining.
  * 🟡 **Warning**: Reaching peak freshness limit (expires in < 3 days).
  * 🔴 **Critical**: Expiry imminent (expires in < 24 hours).
  * ⚫ **Expired**: Item is unsafe for consumption.

### 🍳 AI Recipe Recommendation Engine
* Generates zero-waste recipes strictly using available ingredients currently in your fridge.
* Prioritizes ingredients flagged as 🟡 **Warning** or 🔴 **Critical** to prevent wastage.

### 💬 Conversational Smart AI Query
* Ask contextual questions directly about your inventory:
  * *"What can I cook for lunch today?"*
  * *"Which items should I use before tomorrow?"*
  * *"Do I have enough ingredients to make a salad?"*

### 📊 Real-Time Dashboard Metrics
* Instant snapshot metrics showcasing **Total Items**, **Fresh Count**, **Expiring Soon**, and **Expired Goods**.

---

## 🏛 Architecture & Data Flow

### 🏗 System Architecture Diagram
