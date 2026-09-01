import React, { useEffect, useState } from 'react';
import api from './api';

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState('colors');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [settings, setSettings] = useState({
    colors: {
      primary: '#2764AE',
      secondary: '#0d1b2a',
      sable: '#FAF7F2',
      cobalt: '#2764AE',
      gold: '#C49A45',
      vert: '#27B074',
      dark: '#1B263B',
      light: '#F8F9FA'
    },
    typography: {
      primaryFont: 'Montserrat, sans-serif',
      headingFont: 'Montserrat, sans-serif',
      titleWeight: '900',
      bodyFontSize: '1rem'
    },
    hero: {
      badgeText: 'ONG BUSOLA • PARAKOU, BÉNIN',
      mainTitle: 'Autonomiser les femmes & les jeunes',
      highlightWord: 'pour un avenir équitable.',
      subtitle: 'Organisation Non Gouvernementale engagée pour la santé sexuelle et reproductive, la prévention des VBG, l’autonomisation socio-économique et la justice climatique au Bénin.',
      ctaPrimaryText: 'Découvrir nos actions',
      ctaPrimaryLink: '/actions',
      ctaSecondaryText: 'Nous soutenir',
      ctaSecondaryLink: '/support'
    },
    sloganBanner: {
      text: 'INFORMER, PROTÉGER ET AUTONOMISER POUR DES COMMUNAUTÉS ÉPANOUIES.',
      orangeWords: ['PROTÉGER', 'AUTONOMISER'],
      fontWeight: '900',
      fontStyle: 'italic',
      backgroundColor: '#2764AE',
      textColor: '#FFFFFF',
      highlightColor: '#F2994A',
      containerWidth: '1100px'
    },
    about: {
      storyTitle: 'Notre origine',
      storySubtitle: 'Une conviction née à Parakou',
      textParagraph1: 'Fondée à Parakou, l’ONG BUSOLA est née de la volonté d’apporter une réponse concrète aux défis majeurs auxquels sont confrontés les femmes et les jeunes dans les communautés vulnérables du Bénin.',
      textParagraph2: 'À travers une approche inclusive et ancrée sur le terrain, nous luttons contre les violences basées sur le genre, promouvons la santé et les droits sexuels et reproductifs, et favorisons l’autonomisation économique des femmes et l’engagement des jeunes.',
      imageUrl: '/optimized/about.webp?v=3',
      quoteText: 'Une communauté forte est celle où chaque individu connaît ses droits et dispose des moyens d’agir.',
      quoteAuthor: 'Équipe Dirigeante BUSOLA',
      strategicAxes: [
        { number: '01', title: 'Santé Reproductive & SDSR', subtitle: 'Promotion SDSR', icon: 'Heart', description: 'Éducation complète à la sexualité...', color: '#2764AE' },
        { number: '02', title: 'Prévention des VBG', subtitle: 'Lutte contre les VBG', icon: 'ShieldCheck', description: 'Prise en charge psychosociale...', color: '#C49A45' },
        { number: '03', title: 'Autonomisation & Leadership', subtitle: 'Autonomisation', icon: 'Zap', description: 'Formations professionnelles...', color: '#27B074' },
        { number: '04', title: 'Paix & Justice Climatique', subtitle: 'Justice Climatique', icon: 'Globe', description: 'Actions de sensibilisation...', color: '#0d1b2a' }
      ]
    },
    actionsPage: {
      bannerTitle: 'Nos Actions',
      bannerSubtitle: 'Des initiatives concrètes pour transformer des lives',
      steps: [
        { stepNumber: '01', stepLabel: 'Première Étape', title: 'ÉDUQUER', subtitle: "pour libérer l'esprit", color: '#2764AE', description: 'Le changement commence par le savoir...', imageUrl: '/optimized/action-1.webp?v=2', bullets: [] },
        { stepNumber: '02', stepLabel: 'Deuxième Étape', title: 'PROTÉGER', subtitle: 'pour préserver la dignité', color: '#C49A45', description: 'Chaque personne a le droit de vivre...', imageUrl: '/optimized/action-2.webp', bullets: [] },
        { stepNumber: '03', stepLabel: 'Troisième Étape', title: 'AUTONOMISER', subtitle: "pour bâtir l'avenir", color: '#27B074', description: 'La véritable liberté est économique...', imageUrl: '/optimized/action-3.webp?v=2', bullets: [] }
      ]
    },
    supportPage: {
      title: 'Nous Soutenir',
      subtitle: 'Votre engagement transforme des vies',
      tiers: [
        { amount: 10000, currency: 'FCFA', title: 'Soutien Ponctuel', description: 'Kit d’hygiène menstruelle pour 2 jeunes filles' },
        { amount: 25000, currency: 'FCFA', title: 'Support d’Impact', description: 'Prise en charge médicale d’une survivante de VBG' },
        { amount: 100000, currency: 'FCFA', title: 'Grand Partenaire', description: 'Organisation d’une causerie sur les VBG' }
      ]
    },
    contact: {
      phone: '+229 01 97 00 00 00',
      email: 'contact@ongbusola.org',
      address: 'Quartier Titirou, Parakou, Bénin',
      facebookUrl: 'https://facebook.com/ongbusola',
      twitterUrl: 'https://twitter.com/ongbusola',
      linkedinUrl: 'https://linkedin.com/company/ongbusola',
      instagramUrl: 'https://instagram.com/ongbusola'
    },
    footer: {
      description: 'ONG BUSOLA est une organisation non gouvernementale...',
      copyrightText: '© 2026 ONG BUSOLA. Tous droits réservés.'
    }
  });

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data) {
          setSettings(prev => ({
            ...prev,
            ...res.data,
            colors: { ...prev.colors, ...(res.data.colors || {}) },
            typography: { ...prev.typography, ...(res.data.typography || {}) },
            hero: { ...prev.hero, ...(res.data.hero || {}) },
            sloganBanner: { ...prev.sloganBanner, ...(res.data.sloganBanner || {}) },
            about: { ...prev.about, ...(res.data.about || {}) },
            actionsPage: { ...prev.actionsPage, ...(res.data.actionsPage || {}) },
            supportPage: { ...prev.supportPage, ...(res.data.supportPage || {}) },
            contact: { ...prev.contact, ...(res.data.contact || {}) },
            footer: { ...prev.footer, ...(res.data.footer || {}) }
          }));
        }
      })
      .catch(err => {
        console.error('Erreur chargement settings:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await api.put('/settings', settings);
      setMessage('✅ Toutes les modifications visuelles et de contenu ont été enregistrées avec succès !');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde de la configuration.');
    } finally {
      setSaving(false);
    }
  };

  const updateNested = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Chargement du studio de personnalisation...</div>;
  }

  return (
    <div className="page-shell pb-12">
      <section className="page-header mb-6">
        <div>
          <div className="eyebrow">Studio CMS & Charte Visuelle</div>
          <h2 className="page-title">Personnalisation Intégrale du Site</h2>
          <p className="page-subtitle">Modifiez chaque section, texte, couleur, police et visuel en temps réel sur la plateforme Busola.</p>
        </div>
        <div className="toolbar">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
          </button>
        </div>
      </section>

      {message && (
        <div className="mb-6 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 font-semibold shadow-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 p-4 border border-rose-200 text-rose-800 font-semibold shadow-sm">
          {error}
        </div>
      )}

      {/* Dynamic Tabs Header */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'colors', label: '🎨 Couleurs & Polices' },
          { id: 'hero', label: '🏠 Accueil & Hero' },
          { id: 'slogan', label: '📣 Bannière Slogan' },
          { id: 'about', label: 'ℹ️ À Propos & Conviction' },
          { id: 'actions', label: '🎯 Nos Actions' },
          { id: 'support', label: '💛 Nous Soutenir' },
          { id: 'contact', label: '📞 Contact & Footer' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* --- TAB 1: COULEURS ET POLICES --- */}
        {activeTab === 'colors' && (
          <div className="card space-y-6 p-6">
            <h3 className="text-xl font-bold text-slate-900">Palette de Couleurs Officielles</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Couleur Primaire (Bleu Busola)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.colors.primary}
                    onChange={e => updateNested('colors', 'primary', e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 p-1"
                  />
                  <input
                    type="text"
                    value={settings.colors.primary}
                    onChange={e => updateNested('colors', 'primary', e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Couleur Or / Accent (Gold)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.colors.gold}
                    onChange={e => updateNested('colors', 'gold', e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 p-1"
                  />
                  <input
                    type="text"
                    value={settings.colors.gold}
                    onChange={e => updateNested('colors', 'gold', e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Couleur Vert Impact</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.colors.vert}
                    onChange={e => updateNested('colors', 'vert', e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 p-1"
                  />
                  <input
                    type="text"
                    value={settings.colors.vert}
                    onChange={e => updateNested('colors', 'vert', e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Fond Sable / Crème</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.colors.sable}
                    onChange={e => updateNested('colors', 'sable', e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 p-1"
                  />
                  <input
                    type="text"
                    value={settings.colors.sable}
                    onChange={e => updateNested('colors', 'sable', e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100 my-6" />

            <h3 className="text-xl font-bold text-slate-900">Typographies Globales</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Police Principale (Corps du texte)</label>
                <input
                  type="text"
                  value={settings.typography.primaryFont}
                  onChange={e => updateNested('typography', 'primaryFont', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  placeholder="ex: Montserrat, sans-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Police des Titres</label>
                <input
                  type="text"
                  value={settings.typography.headingFont}
                  onChange={e => updateNested('typography', 'headingFont', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  placeholder="ex: Montserrat, sans-serif"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: ACCUEIL & HERO --- */}
        {activeTab === 'hero' && (
          <div className="card space-y-6 p-6">
            <h3 className="text-xl font-bold text-slate-900">Section Hero (En-tête d'Accueil)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Badge Haut de page</label>
                <input
                  type="text"
                  value={settings.hero.badgeText}
                  onChange={e => updateNested('hero', 'badgeText', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Titre Principal</label>
                <input
                  type="text"
                  value={settings.hero.mainTitle}
                  onChange={e => updateNested('hero', 'mainTitle', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Texte / Mot Mis en Valeur</label>
                <input
                  type="text"
                  value={settings.hero.highlightWord}
                  onChange={e => updateNested('hero', 'highlightWord', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-emerald-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Sous-titre descriptif</label>
                <textarea
                  rows={3}
                  value={settings.hero.subtitle}
                  onChange={e => updateNested('hero', 'subtitle', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: BANNIÈRE SLOGAN --- */}
        {activeTab === 'slogan' && (
          <div className="card space-y-6 p-6">
            <h3 className="text-xl font-bold text-slate-900">Bannière Slogan Grand Format</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Texte du Slogan</label>
                <textarea
                  rows={3}
                  value={settings.sloganBanner.text}
                  onChange={e => updateNested('sloganBanner', 'text', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold uppercase"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Couleur de fond du slogan</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.sloganBanner.backgroundColor}
                      onChange={e => updateNested('sloganBanner', 'backgroundColor', e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 p-1"
                    />
                    <input
                      type="text"
                      value={settings.sloganBanner.backgroundColor}
                      onChange={e => updateNested('sloganBanner', 'backgroundColor', e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Largeur maximale du conteneur</label>
                  <input
                    type="text"
                    value={settings.sloganBanner.containerWidth}
                    onChange={e => updateNested('sloganBanner', 'containerWidth', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono"
                    placeholder="ex: 1100px"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: À PROPOS & CONVICTION --- */}
        {activeTab === 'about' && (
          <div className="card space-y-6 p-6">
            <h3 className="text-xl font-bold text-slate-900">Section À Propos & Conviction</h3>
            <div className="space-y-4">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Sur-titre ("Notre origine")</label>
                  <input
                    type="text"
                    value={settings.about.storyTitle}
                    onChange={e => updateNested('about', 'storyTitle', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Grand Titre de Section</label>
                  <input
                    type="text"
                    value={settings.about.storySubtitle}
                    onChange={e => updateNested('about', 'storySubtitle', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Premier Paragraphe d'Histoire</label>
                <textarea
                  rows={4}
                  value={settings.about.textParagraph1}
                  onChange={e => updateNested('about', 'textParagraph1', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Second Paragraphe d'Histoire</label>
                <textarea
                  rows={4}
                  value={settings.about.textParagraph2}
                  onChange={e => updateNested('about', 'textParagraph2', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">URL de l'image officielle À Propos</label>
                <input
                  type="text"
                  value={settings.about.imageUrl}
                  onChange={e => updateNested('about', 'imageUrl', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: NOS ACTIONS --- */}
        {activeTab === 'actions' && (
          <div className="card space-y-6 p-6">
            <h3 className="text-xl font-bold text-slate-900">En-tête de la Page Nos Actions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Titre de la bannière</label>
                <input
                  type="text"
                  value={settings.actionsPage.bannerTitle}
                  onChange={e => updateNested('actionsPage', 'bannerTitle', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Sous-titre de la bannière</label>
                <input
                  type="text"
                  value={settings.actionsPage.bannerSubtitle}
                  onChange={e => updateNested('actionsPage', 'bannerSubtitle', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 6: NOUS SOUTENIR --- */}
        {activeTab === 'support' && (
          <div className="card space-y-6 p-6">
            <h3 className="text-xl font-bold text-slate-900">Grille des Paliers de Dons</h3>
            <div className="space-y-6">
              {settings.supportPage.tiers.map((tier, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Palier #{idx + 1}</span>
                    <input
                      type="number"
                      value={tier.amount}
                      onChange={e => {
                        const newTiers = [...settings.supportPage.tiers];
                        newTiers[idx].amount = Number(e.target.value);
                        updateNested('supportPage', 'tiers', newTiers);
                      }}
                      className="w-40 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Titre / Formule</label>
                    <input
                      type="text"
                      value={tier.title || ''}
                      onChange={e => {
                        const newTiers = [...settings.supportPage.tiers];
                        newTiers[idx].title = e.target.value;
                        updateNested('supportPage', 'tiers', newTiers);
                      }}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description / Impact précis</label>
                    <input
                      type="text"
                      value={tier.description || ''}
                      onChange={e => {
                        const newTiers = [...settings.supportPage.tiers];
                        newTiers[idx].description = e.target.value;
                        updateNested('supportPage', 'tiers', newTiers);
                      }}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 7: CONTACT & FOOTER --- */}
        {activeTab === 'contact' && (
          <div className="card space-y-6 p-6">
            <h3 className="text-xl font-bold text-slate-900">Coordonnées de Contact & Pied de Page</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Téléphone Officiel</label>
                <input
                  type="text"
                  value={settings.contact.phone}
                  onChange={e => updateNested('contact', 'phone', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Adresse E-mail Officielle</label>
                <input
                  type="email"
                  value={settings.contact.email}
                  onChange={e => updateNested('contact', 'email', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Adresse Physique</label>
                <input
                  type="text"
                  value={settings.contact.address}
                  onChange={e => updateNested('contact', 'address', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Texte Copyright Footer</label>
                <input
                  type="text"
                  value={settings.footer.copyrightText}
                  onChange={e => updateNested('footer', 'copyrightText', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Description Synthétique du Footer</label>
              <textarea
                rows={3}
                value={settings.footer.description}
                onChange={e => updateNested('footer', 'description', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-xl transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Enregistrement en cours...' : '💾 Enregistrer la configuration complète'}
          </button>
        </div>
      </form>
    </div>
  );
}
