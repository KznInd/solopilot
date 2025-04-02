'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRightIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  ClockIcon,
  CalendarIcon,
  ListBulletIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
  CheckIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
  CloudArrowUpIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { ScrollProgress } from '@/components/ui/ScrollProgress';

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay,
        ease: "easeOut"
      }
    })
  };

  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const calculatePrice = (basePrice: number) => {
    if (isAnnual) {
      const annualPrice = basePrice * 12;
      return `${Math.floor(annualPrice * 0.8)}€`;
    }
    return `${basePrice}€`;
  };

  const getPeriod = () => isAnnual ? "/an" : "/mois";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary-950/5 dark:from-black dark:via-black dark:to-primary-950/20 relative overflow-hidden">
      <ScrollProgress />
      
      {/* Effets de fond modernes */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      <motion.div 
        className="absolute inset-0 bg-gradient-radial from-primary-500/5 via-transparent to-transparent glow"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.3, 0.5] 
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Hero Section */}
      <motion.div 
        className="relative perspective-container"
        style={{ opacity, scale }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="relative inline-block"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 blur-3xl opacity-20 neon-glow"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2] 
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="relative floating">
              <div className="relative">
                <h1 className="text-6xl sm:text-8xl font-bold text-foreground mb-4">
                  SoloPilot
                </h1>
                <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-semibold text-secondary-600 dark:text-secondary-400">
                  <SparklesIcon className="w-8 h-8" />
                  <p>Gestion de projet simplifiée et collaborative</p>
                  <SparklesIcon className="w-8 h-8" />
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.p 
            variants={fadeInUpVariant}
            custom={0.2}
            initial="hidden"
            animate="visible"
            className="mt-8 text-xl sm:text-2xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto glass-morphism p-6 rounded-2xl"
          >
            Simplifiez la gestion de vos projets. Collaborez efficacement.
          </motion.p>
          
          <motion.div 
            variants={fadeInUpVariant}
            custom={0.4}
            initial="hidden"
            animate="visible"
            className="mt-12 flex flex-col sm:flex-row justify-center gap-6"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="neo-brutalism group px-8 py-4 text-lg font-medium rounded-2xl bg-gradient-to-r from-primary-600 to-accent-500 text-white transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg neon-glow"
              >
                Commencer Gratuitement
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-morphism px-8 py-4 text-lg font-medium rounded-2xl gradient-border transition-all duration-300"
              >
                Se Connecter
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Benefits Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Pourquoi choisir SoloPilot ?
            </h2>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariant}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                variants={fadeInUpVariant}
                custom={index * 0.1}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-3xl blur-xl transform group-hover:scale-105 transition-transform duration-300" />
                <div className="relative p-8 rounded-3xl bg-background/50 dark:bg-black/30 backdrop-blur-xl border border-primary-500/10 h-full">
                  <div className="w-12 h-12 text-primary-500 mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Grid Section with more details */}
      <div className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Fonctionnalités principales
            </h2>
            <p className="mt-4 text-xl text-secondary-600 dark:text-secondary-400">
              Des outils puissants pour une gestion efficace
            </p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariant}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUpVariant}
                custom={index * 0.1}
                whileHover={{ scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-3xl blur-xl" />
                <div className="relative p-8 rounded-3xl bg-background/50 dark:bg-black/30 backdrop-blur-xl border border-primary-500/10 group-hover:border-primary-500/40 transition-all duration-300">
                  <div className="w-12 h-12 text-primary-500 mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                        <CheckIcon className="w-4 h-4 text-primary-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative py-24 bg-gradient-to-b from-transparent via-primary-950/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Ce que disent nos clients
            </h2>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariant}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                variants={fadeInUpVariant}
                custom={index * 0.1}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 rounded-3xl blur-xl" />
                <div className="relative p-8 rounded-3xl bg-background/50 dark:bg-black/30 backdrop-blur-xl border border-primary-500/10">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Integration Section */}
      <div className="relative py-32 bg-gradient-to-b from-transparent via-primary-950/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Intégrations avancées
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400">
              Connectez SoloPilot à vos outils favoris
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariant}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                variants={fadeInUpVariant}
                custom={index * 0.1}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 rounded-2xl blur-lg transform group-hover:scale-110 transition-transform duration-300" />
                <div className="relative p-6 rounded-2xl bg-background/80 dark:bg-black/50 backdrop-blur-xl border border-primary-500/10 group-hover:border-primary-500/30 transition-all duration-300">
                  <div className="flex flex-col items-center gap-4">
                    <motion.img 
                      src={integration.logo} 
                      alt={integration.name}
                      className="w-16 h-16 object-contain"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <p className="text-lg font-medium text-foreground">
                      {integration.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-lg text-secondary-600 dark:text-secondary-400">
              Et plus de 40 autres intégrations disponibles pour optimiser votre workflow
            </p>
            <Link href="/integrations">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 px-8 py-3 rounded-xl font-medium bg-background/80 dark:bg-black/50 backdrop-blur-xl border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300"
              >
                Voir toutes les intégrations
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Tarifs adaptés à vos besoins
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400">
              Choisissez le plan qui correspond à votre équipe
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className="text-secondary-600 dark:text-secondary-400">Mensuel</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                  isAnnual ? 'bg-primary-500' : 'bg-secondary-400'
                }`}
              >
                <motion.div
                  animate={{ x: isAnnual ? 32 : 2 }}
                  className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full"
                />
              </button>
              <span className="text-secondary-600 dark:text-secondary-400">
                Annuel
                <span className="ml-2 text-xs text-primary-500">-20%</span>
              </span>
            </div>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariant}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.title}
                variants={fadeInUpVariant}
                custom={index * 0.1}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-3xl p-8 ${
                  plan.featured 
                    ? 'bg-gradient-to-b from-primary-500/10 to-accent-500/10 border-2 border-primary-500'
                    : 'bg-background/50 dark:bg-black/30 border border-primary-500/10'
                }`}
              >
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-2xl font-bold">{plan.title}</h3>
                  {plan.featured && (
                    <span className="px-3 py-1 text-sm text-primary-500 bg-primary-500/10 rounded-full">
                      Populaire
                    </span>
                  )}
                </div>
                <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                  {plan.description}
                </p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">{calculatePrice(plan.price)}</span>
                  <span className="text-secondary-600 dark:text-secondary-400">{getPeriod()}</span>
                </div>
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckIcon className="w-5 h-5 text-primary-500 mt-0.5" />
                      ) : (
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-secondary-400"></div>
                        </div>
                      )}
                      <span className={`${
                        feature.included 
                          ? 'text-foreground' 
                          : 'text-secondary-600 dark:text-secondary-400'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                      plan.featured 
                        ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white'
                        : 'border-2 border-primary-500/20 hover:border-primary-500/40'
                    }`}
                  >
                    {plan.price === 0 ? 'Commencer gratuitement' : 'Essai gratuit 14 jours'}
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-32 bg-gradient-to-b from-transparent via-primary-950/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariant}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUpVariant}
                custom={index * 0.1}
                className="text-center"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-2 text-secondary-600 dark:text-secondary-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative py-32 bg-gradient-to-b from-transparent via-primary-950/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Contactez-nous
            </h2>
            <p className="mt-4 text-xl text-secondary-600 dark:text-secondary-400">
              Notre équipe est là pour vous aider
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariant}
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
          >
            <motion.div
              variants={fadeInUpVariant}
              className="glass-card p-8 rounded-3xl neo-brutalism"
            >
              <h3 className="text-2xl font-bold gradient-text mb-6">Informations de contact</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <EnvelopeIcon className="w-6 h-6 text-primary-500" />
                  <a href="mailto:contact@solopilot.com" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-500 transition-colors">
                    contact@solopilot.com
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <PhoneIcon className="w-6 h-6 text-primary-500" />
                  <a href="tel:+33123456789" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-500 transition-colors">
                    +33 1 23 45 67 89
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <MapPinIcon className="w-6 h-6 text-primary-500" />
                  <span className="text-secondary-600 dark:text-secondary-400">
                    Paris, France
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.form
              variants={fadeInUpVariant}
              className="glass-card p-8 rounded-3xl neo-brutalism space-y-6"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 rounded-xl bg-background/50 border border-primary-500/20 focus:border-primary-500 transition-colors"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 rounded-xl bg-background/50 border border-primary-500/20 focus:border-primary-500 transition-colors"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl bg-background/50 border border-primary-500/20 focus:border-primary-500 transition-colors"
                  placeholder="Votre message..."
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-6 rounded-xl font-medium bg-gradient-to-r from-primary-600 to-accent-500 text-white transition-all duration-300 neon-glow"
              >
                Envoyer
              </motion.button>
            </motion.form>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative mt-20 border-t gradient-border bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            className="text-center text-secondary-600 dark:text-secondary-400"
            whileHover={{ scale: 1.02 }}
          >
            <p className="gradient-text">© 2024 SoloPilot. Votre partenaire pour une gestion de projets simple, efficace et collaborative.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

const benefits = [
  {
    icon: <RocketLaunchIcon className="w-full h-full" />,
    title: "Démarrage rapide",
    description: "Commencez à utiliser SoloPilot en quelques minutes. Interface intuitive et prise en main immédiate."
  },
  {
    icon: <ShieldCheckIcon className="w-full h-full" />,
    title: "Sécurité maximale",
    description: "Vos données sont protégées avec un chiffrement de bout en bout et des sauvegardes automatiques."
  },
  {
    icon: <CubeTransparentIcon className="w-full h-full" />,
    title: "Flexibilité totale",
    description: "Adaptez SoloPilot à vos besoins avec des workflows personnalisables et des intégrations sur mesure."
  }
];

const features = [
  {
    icon: <ListBulletIcon className="w-full h-full" />,
    title: "Gestion des tâches",
    description: "Organisez et suivez vos tâches avec une interface intuitive et personnalisable.",
    details: [
      "Tableaux Kanban personnalisables",
      "Sous-tâches et dépendances",
      "Étiquettes et filtres avancés",
      "Rappels et notifications"
    ]
  },
  {
    icon: <CalendarIcon className="w-full h-full" />,
    title: "Planning intelligent",
    description: "Visualisez et planifiez vos projets avec des vues adaptées à vos besoins.",
    details: [
      "Vue Gantt interactive",
      "Calendrier multi-projets",
      "Planification automatique",
      "Gestion des ressources"
    ]
  },
  {
    icon: <BoltIcon className="w-full h-full" />,
    title: "Automatisation",
    description: "Automatisez les tâches répétitives et gagnez en productivité.",
    details: [
      "Workflows personnalisables",
      "Déclencheurs automatiques",
      "Intégrations natives",
      "Templates réutilisables"
    ]
  },
  {
    icon: <ChartBarIcon className="w-full h-full" />,
    title: "Analytics avancés",
    description: "Suivez la performance de vos projets avec des tableaux de bord détaillés.",
    details: [
      "Rapports personnalisés",
      "Métriques en temps réel",
      "Prévisions et tendances",
      "Export de données"
    ]
  },
  {
    icon: <CloudArrowUpIcon className="w-full h-full" />,
    title: "Stockage cloud",
    description: "Gérez vos fichiers et documents directement dans vos projets.",
    details: [
      "Stockage illimité",
      "Versioning des fichiers",
      "Prévisualisation intégrée",
      "Partage sécurisé"
    ]
  },
  {
    icon: <CommandLineIcon className="w-full h-full" />,
    title: "API & Extensibilité",
    description: "Étendez les capacités de SoloPilot selon vos besoins.",
    details: [
      "API REST complète",
      "Webhooks personnalisables",
      "SDK développeur",
      "Marketplace d'extensions"
    ]
  }
];

const testimonials = [
  {
    text: "SoloPilot a transformé notre façon de gérer les projets. L'interface est intuitive et les fonctionnalités sont exactement ce dont nous avions besoin.",
    author: "Marie Dubois",
    role: "Chef de Projet, TechCorp"
  },
  {
    text: "La flexibilité de SoloPilot nous permet d'adapter l'outil à notre workflow unique. Le support est également excellent.",
    author: "Thomas Martin",
    role: "Directeur Technique, StartupFlow"
  },
  {
    text: "Depuis que nous utilisons SoloPilot, notre productivité a augmenté de 40%. Les automatisations nous font gagner un temps précieux.",
    author: "Sophie Bernard",
    role: "Product Owner, InnovTech"
  }
];

const integrations = [
  { 
    name: "Slack", 
    logo: "/integrations/slack.svg",
    description: "Communication en temps réel"
  },
  { 
    name: "Google Drive", 
    logo: "/integrations/google-drive.svg",
    description: "Stockage et partage de fichiers"
  },
  { 
    name: "Zoom", 
    logo: "/integrations/zoom.svg",
    description: "Visioconférence intégrée"
  },
  { 
    name: "GitHub", 
    logo: "/integrations/github.svg",
    description: "Gestion de code source"
  }
];

const pricingPlans = [
  {
    title: "Starter",
    price: 0,
    description: "Parfait pour démarrer et tester SoloPilot",
    features: [
      {
        included: true,
        text: "3 projets actifs maximum"
      },
      {
        included: true,
        text: "Jusqu'à 5 utilisateurs"
      },
      {
        included: true,
        text: "Tableaux Kanban basiques"
      },
      {
        included: true,
        text: "Vue calendrier simple"
      },
      {
        included: true,
        text: "Support communautaire"
      },
      {
        included: false,
        text: "Intégrations avancées"
      },
      {
        included: false,
        text: "Automatisations"
      },
      {
        included: false,
        text: "Rapports personnalisés"
      },
      {
        included: false,
        text: "Support prioritaire"
      }
    ]
  },
  {
    title: "Pro",
    price: 19,
    description: "Pour les équipes qui veulent plus de puissance",
    featured: true,
    features: [
      {
        included: true,
        text: "Projets illimités"
      },
      {
        included: true,
        text: "Jusqu'à 20 utilisateurs"
      },
      {
        included: true,
        text: "Tableaux Kanban avancés"
      },
      {
        included: true,
        text: "Vue Gantt interactive"
      },
      {
        included: true,
        text: "Automatisations basiques"
      },
      {
        included: true,
        text: "Intégrations principales"
      },
      {
        included: true,
        text: "Support prioritaire"
      },
      {
        included: true,
        text: "Rapports personnalisés"
      },
      {
        included: false,
        text: "API personnalisée"
      },
      {
        included: false,
        text: "Formation sur mesure"
      }
    ]
  },
  {
    title: "Enterprise",
    price: 49,
    description: "Solutions personnalisées pour grandes équipes",
    features: [
      {
        included: true,
        text: "Projets illimités"
      },
      {
        included: true,
        text: "Utilisateurs illimités"
      },
      {
        included: true,
        text: "Toutes les fonctionnalités Pro"
      },
      {
        included: true,
        text: "Support dédié 24/7"
      },
      {
        included: true,
        text: "API personnalisée"
      },
      {
        included: true,
        text: "Formation sur mesure"
      },
      {
        included: true,
        text: "Audit de sécurité avancé"
      },
      {
        included: true,
        text: "SLA garanti"
      },
      {
        included: true,
        text: "Intégrations illimitées"
      },
      {
        included: true,
        text: "Automatisations avancées"
      }
    ]
  }
];

const stats = [
  { value: "10K+", label: "Utilisateurs actifs" },
  { value: "50K+", label: "Projets gérés" },
  { value: "99.9%", label: "Disponibilité" },
  { value: "24/7", label: "Support client" }
];
