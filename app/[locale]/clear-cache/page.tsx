"use client";

/**
 * Cache Clearing Page
 * Helps users clear service workers and browser caches
 */

import { useEffect, useState } from "react";

export default function ClearCachePage() {
  const [status, setStatus] = useState<string>("");
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");

  useEffect(() => {
    setStatus("ℹ️ Click buttons above to clear caches");
    setStatusType("info");
  }, []);

  const showStatus = (message: string, type: "info" | "success" | "error" = "info") => {
    setStatus(message);
    setStatusType(type);
  };

  const clearServiceWorker = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
          showStatus(`✅ Unregistered service worker: ${registration.scope}`, "success");
        }
        if (registrations.length === 0) {
          showStatus("ℹ️ No service workers found", "info");
        }
      } else {
        showStatus("ℹ️ Service Workers not supported", "info");
      }
    } catch (error) {
      showStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`, "error");
    }
  };

  const clearAllCaches = async () => {
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        for (let cacheName of cacheNames) {
          await caches.delete(cacheName);
          showStatus(`✅ Deleted cache: ${cacheName}`, "success");
        }
        if (cacheNames.length === 0) {
          showStatus("ℹ️ No caches found", "info");
        }
      } else {
        showStatus("ℹ️ Cache API not supported", "info");
      }
    } catch (error) {
      showStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`, "error");
    }
  };

  const clearLocalStorage = () => {
    try {
      localStorage.clear();
      showStatus("✅ Cleared LocalStorage", "success");
    } catch (error) {
      showStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`, "error");
    }
  };

  const clearSessionStorage = () => {
    try {
      sessionStorage.clear();
      showStatus("✅ Cleared SessionStorage", "success");
    } catch (error) {
      showStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`, "error");
    }
  };

  const clearAll = async () => {
    showStatus("🔄 Clearing everything...", "info");
    await clearServiceWorker();
    await clearAllCaches();
    clearLocalStorage();
    clearSessionStorage();
    setTimeout(() => {
      showStatus("✅ All caches cleared! Please refresh the page.", "success");
    }, 500);
  };

  const statusColors = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clear Service Worker & Cache</h1>
          <p className="text-gray-600 mb-6">
            This page will help you clear all caches and service workers.
          </p>
          <p className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded p-3 mb-6">
            <strong>Note:</strong> Make sure you&apos;re accessing this on the correct port (3001)
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={clearServiceWorker}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear Service Worker
            </button>
            <button
              onClick={clearAllCaches}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear All Caches
            </button>
            <button
              onClick={clearLocalStorage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear LocalStorage
            </button>
            <button
              onClick={clearSessionStorage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear SessionStorage
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
            >
              Clear Everything
            </button>
          </div>

          {status && (
            <div
              className={`p-4 rounded-md border ${statusColors[statusType]}`}
            >
              {status}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h2 className="font-semibold mb-2">Alternative Method:</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Open DevTools (F12)</li>
              <li>Go to Application tab</li>
              <li>Click &quot;Clear storage&quot; in the left sidebar</li>
              <li>Check all boxes</li>
              <li>Click &quot;Clear site data&quot;</li>
              <li>Refresh the page</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

