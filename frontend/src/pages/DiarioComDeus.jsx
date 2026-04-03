import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';


const API_BASE = import.meta.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com';
const FEELINGS = [
  { key: 'sad', emoji: 'Triste' },
  { key: 'peace', emoji: 'Em paz' },
  { key: 'grateful', emoji: 'Grato' },
  { key: 'strong', emoji: 'Fortalecido' },
];
