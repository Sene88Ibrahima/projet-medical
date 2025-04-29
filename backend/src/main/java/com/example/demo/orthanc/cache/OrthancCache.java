package com.example.demo.orthanc.cache;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Cache pour les réponses d'Orthanc avec expiration automatique des entrées
 * Permet d'éviter les requêtes répétitives vers Orthanc pour les mêmes données
 */
@Slf4j
@Component
public class OrthancCache {

    // Structure de données pour stocker les entrées du cache avec leur timestamp d'expiration
    private static class CacheEntry<T> {
        private final T value;
        private final long expirationTime;

        public CacheEntry(T value, long ttlMillis) {
            this.value = value;
            this.expirationTime = System.currentTimeMillis() + ttlMillis;
        }

        public boolean isExpired() {
            return System.currentTimeMillis() > expirationTime;
        }

        public T getValue() {
            return value;
        }
    }

    // Caches pour différents types de données
    private final Map<String, CacheEntry<Object>> studyCache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry<Object>> seriesCache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry<Object>> instanceCache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry<byte[]>> imageCache = new ConcurrentHashMap<>();

    // Durées de vie par défaut (en millisecondes)
    private static final long STUDY_TTL = 5 * 60 * 1000; // 5 minutes
    private static final long SERIES_TTL = 5 * 60 * 1000; // 5 minutes
    private static final long INSTANCE_TTL = 10 * 60 * 1000; // 10 minutes
    private static final long IMAGE_TTL = 15 * 60 * 1000; // 15 minutes

    private final ScheduledExecutorService cleanupExecutor;

    public OrthancCache() {
        // Planifier le nettoyage périodique du cache
        cleanupExecutor = Executors.newSingleThreadScheduledExecutor();
        cleanupExecutor.scheduleAtFixedRate(this::cleanupCache, 1, 1, TimeUnit.MINUTES);
        log.info("Cache Orthanc initialisé avec succès");
    }

    /**
     * Nettoie les entrées expirées du cache
     */
    private void cleanupCache() {
        try {
            int studyRemoved = removeExpiredEntries(studyCache);
            int seriesRemoved = removeExpiredEntries(seriesCache);
            int instanceRemoved = removeExpiredEntries(instanceCache);
            int imageRemoved = removeExpiredEntries(imageCache);

            if (studyRemoved + seriesRemoved + instanceRemoved + imageRemoved > 0) {
                log.debug("Nettoyage du cache Orthanc: {} études, {} séries, {} instances, {} images supprimées",
                        studyRemoved, seriesRemoved, instanceRemoved, imageRemoved);
            }
        } catch (Exception e) {
            log.error("Erreur lors du nettoyage du cache Orthanc", e);
        }
    }

    private <T> int removeExpiredEntries(Map<String, CacheEntry<T>> cache) {
        int count = 0;
        for (Map.Entry<String, CacheEntry<T>> entry : cache.entrySet()) {
            if (entry.getValue().isExpired()) {
                cache.remove(entry.getKey());
                count++;
            }
        }
        return count;
    }

    /**
     * Récupère une étude du cache ou null si non présente/expirée
     */
    @SuppressWarnings("unchecked")
    public <T> T getStudy(String studyId) {
        CacheEntry<Object> entry = studyCache.get(studyId);
        if (entry != null && !entry.isExpired()) {
            log.debug("Cache hit pour l'étude {}", studyId);
            return (T) entry.getValue();
        }
        return null;
    }

    /**
     * Met en cache une étude
     */
    public <T> void putStudy(String studyId, T study) {
        studyCache.put(studyId, new CacheEntry<>(study, STUDY_TTL));
        log.debug("Étude {} mise en cache", studyId);
    }

    /**
     * Récupère une série du cache ou null si non présente/expirée
     */
    @SuppressWarnings("unchecked")
    public <T> T getSeries(String seriesId) {
        CacheEntry<Object> entry = seriesCache.get(seriesId);
        if (entry != null && !entry.isExpired()) {
            log.debug("Cache hit pour la série {}", seriesId);
            return (T) entry.getValue();
        }
        return null;
    }

    /**
     * Met en cache une série
     */
    public <T> void putSeries(String seriesId, T series) {
        seriesCache.put(seriesId, new CacheEntry<>(series, SERIES_TTL));
        log.debug("Série {} mise en cache", seriesId);
    }

    /**
     * Récupère une instance du cache ou null si non présente/expirée
     */
    @SuppressWarnings("unchecked")
    public <T> T getInstance(String instanceId) {
        CacheEntry<Object> entry = instanceCache.get(instanceId);
        if (entry != null && !entry.isExpired()) {
            log.debug("Cache hit pour l'instance {}", instanceId);
            return (T) entry.getValue();
        }
        return null;
    }

    /**
     * Met en cache une instance
     */
    public <T> void putInstance(String instanceId, T instance) {
        instanceCache.put(instanceId, new CacheEntry<>(instance, INSTANCE_TTL));
        log.debug("Instance {} mise en cache", instanceId);
    }

    /**
     * Récupère une image du cache ou null si non présente/expirée
     */
    public byte[] getImage(String instanceId) {
        CacheEntry<byte[]> entry = imageCache.get(instanceId);
        if (entry != null && !entry.isExpired()) {
            log.debug("Cache hit pour l'image de l'instance {}", instanceId);
            return entry.getValue();
        }
        return null;
    }

    /**
     * Met en cache une image
     */
    public void putImage(String instanceId, byte[] imageData) {
        if (imageData != null && imageData.length > 0) {
            imageCache.put(instanceId, new CacheEntry<>(imageData, IMAGE_TTL));
            log.debug("Image pour l'instance {} mise en cache ({} octets)", instanceId, imageData.length);
        }
    }

    /**
     * Invalide une étude et toutes ses séries/instances associées
     */
    public void invalidateStudy(String studyId) {
        studyCache.remove(studyId);
        log.debug("Étude {} invalidée dans le cache", studyId);
    }

    /**
     * Invalide une série et toutes ses instances associées
     */
    public void invalidateSeries(String seriesId) {
        seriesCache.remove(seriesId);
        log.debug("Série {} invalidée dans le cache", seriesId);
    }

    /**
     * Invalide une instance et son image associée
     */
    public void invalidateInstance(String instanceId) {
        instanceCache.remove(instanceId);
        imageCache.remove(instanceId);
        log.debug("Instance {} et son image invalidées dans le cache", instanceId);
    }

    /**
     * Vide complètement le cache
     */
    public void clearCache() {
        studyCache.clear();
        seriesCache.clear();
        instanceCache.clear();
        imageCache.clear();
        log.info("Cache Orthanc vidé");
    }
}
