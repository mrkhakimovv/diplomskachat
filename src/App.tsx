/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Baza } from './pages/Baza';
import { DiplomaView } from './pages/DiplomaView';

export default function App() {
  return (
    <Router>
      <div className="h-screen bg-slate-50 flex overflow-hidden font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
            <h1 className="text-slate-800 font-semibold text-lg">Diplomlarni boshqarish paneli</h1>
          </header>
          <div className="flex-1 overflow-auto p-4 sm:p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/baza" element={<Baza />} />
              <Route path="/diploma/:id" element={<DiplomaView />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
