/**
 * Nettoie les données avant insertion/mise à jour en base de données
 * Supprime les champs qui ne doivent pas être modifiés
 */
export const sanitizeUpdateData = (data) => {
  const cleaned = { ...data };
  
  // Supprimer les champs système
  delete cleaned.id;
  delete cleaned.created_at;
  delete cleaned.updated_at;
  
  // Convertir les booléens string en vrais booléens
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === 'true') cleaned[key] = true;
    if (cleaned[key] === 'false') cleaned[key] = false;
    
    // Convertir les strings vides en NULL pour les champs optionnels
    if (cleaned[key] === '') cleaned[key] = null;
  });
  
  return cleaned;
};

/**
 * Nettoie les données avant insertion en base de données
 */
export const sanitizeInsertData = (data) => {
  const cleaned = { ...data };
  
  // Supprimer les champs système
  delete cleaned.id;
  delete cleaned.created_at;
  delete cleaned.updated_at;
  
  // Convertir les booléens string en vrais booléens
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === 'true') cleaned[key] = true;
    if (cleaned[key] === 'false') cleaned[key] = false;
    
    // Convertir les strings vides en NULL pour les champs optionnels
    if (cleaned[key] === '') cleaned[key] = null;
  });
  
  return cleaned;
};
