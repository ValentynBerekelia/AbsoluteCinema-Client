import React, { useState, useEffect } from 'react';
import { MediaType, Media } from '@/types/Media';
import { createAndAttachMedia, deleteMedia } from '@/api/movies';
import './MediaManager.css';
import { useToast } from '@/context/ToastContext/ToastContext';

interface MediaManagerProps {
    movieId: string;
    initialStills: Media[];
    initialTrailers?: Media[];
    initialBanner?: Media;
}

export const MediaManager: React.FC<MediaManagerProps> = ({
    movieId,
    initialStills,
    initialTrailers,
    initialBanner
}) => {
    const { showToast } = useToast();
    const [stills, setStills] = useState<Media[]>(initialStills);
    const [trailers, setTrailers] = useState<Media[]>(initialTrailers || []);
    const [banner, setBanner] = useState<Media | null>(initialBanner || null);

    const [stillInput, setStillInput] = useState('');
    const [trailerInput, setTrailerInput] = useState('');
    const [bannerInput, setBannerInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { setStills(initialStills); }, [initialStills]);
    useEffect(() => { setTrailers(initialTrailers || []); }, [initialTrailers]);
    useEffect(() => { setBanner(initialBanner || null); }, [initialBanner]);

    const handleAddMedia = async (url: string, type: MediaType) => {
        if (!url.trim()) return;
        setLoading(true);
        try {
            const response = await createAndAttachMedia(movieId, { url, type });
            const newId = response.mediaId || Date.now().toString();
            const newMedia: Media = { id: newId, url, type };

            if (type === MediaType.Image) {
                setStills(prev => [...prev, newMedia]);
                setStillInput('');
            } else if (type === MediaType.Video) {
                setTrailers(prev => [...prev, newMedia]);
                setTrailerInput('');
            } else if (type === MediaType.BannerImage) {
                setBanner(newMedia);
                setBannerInput('');
            }
        } catch (err) {
            showToast('error', "Failed to attach media");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (mediaId: string, type: MediaType) => {
        try {
            await deleteMedia(movieId, mediaId);
            if (type === MediaType.Image) setStills(prev => prev.filter(m => m.id !== mediaId));
            if (type === MediaType.Video) setTrailers(prev => prev.filter(m => m.id !== mediaId));
            if (type === MediaType.BannerImage) setBanner(null);
        } catch (err) {
            showToast('error', "Failed to remove media");
        }
    };

    return (
        <div className="media-section">
            <div className="media-section-header">
                <h3>Media & Promotional Materials</h3>
                <p>Manage trailers, banners, and gallery stills for this movie.</p>
            </div>

            <div className="media-grid">
                {/* Hero Banner */}
                <div className="media-card">
                    <h4>Hero Banner (Main Page)</h4>
                    <div className="media-input-row">
                        <input
                            value={bannerInput}
                            onChange={e => setBannerInput(e.target.value)}
                            placeholder="Banner Image URL"
                            className="form-input"
                            disabled={!!banner || loading}
                        />
                        <button
                            className="media-action-btn"
                            onClick={() => handleAddMedia(bannerInput, MediaType.BannerImage)}
                            disabled={loading || !bannerInput.trim() || !!banner}
                        >Add</button>
                    </div>
                    {banner ? (
                        <div className="media-preview-banner">
                            <img src={banner.url} alt="Banner" />
                            <button className="media-remove-btn" onClick={() => handleRemove(banner.id, MediaType.BannerImage as MediaType)}>✕</button>
                        </div>
                    ) : <p className="media-empty">No banner added.</p>}
                </div>

                {/* Trailers */}
                <div className="media-card">
                    <h4>Trailers Gallery</h4>
                    <div className="media-input-row">
                        <input
                            value={trailerInput}
                            onChange={e => setTrailerInput(e.target.value)}
                            placeholder="YouTube URL"
                            className="form-input"
                            disabled={loading}
                        />
                        <button
                            className='media-action-btn'
                            onClick={() => handleAddMedia(trailerInput, MediaType.Video)}
                            disabled={loading || !trailerInput.trim()}
                        >Add</button>
                    </div>
                    <div className="media-links-list">
                        {trailers.length > 0 ? trailers.map(t => (
                            <div key={t.id} className="media-link-item">
                                <a href={t.url} target="_blank" rel="noreferrer">{t.url}</a>
                                <button className="media-link-remove" onClick={() => handleRemove(t.id, MediaType.Video)}>✕</button>
                            </div>
                        )) : <p className="media-empty">No trailers added.</p>}
                    </div>
                </div>

                {/* Stills */}
                <div className="media-card full-width">
                    <h4>Gallery Stills</h4>
                    <div className="media-input-row">
                        <input
                            value={stillInput}
                            onChange={e => setStillInput(e.target.value)}
                            placeholder="Image URL"
                            className="form-input"
                            disabled={loading}
                        />
                        <button
                            className="media-action-btn"
                            onClick={() => handleAddMedia(stillInput, MediaType.Image)}
                            disabled={loading || !stillInput.trim()}
                        >Add to Gallery</button>
                    </div>
                    <div className="media-preview-grid">
                        {stills.map(s => (
                            <div key={s.id} className="media-preview-card">
                                <img src={s.url} alt="Still" />
                                <button className="media-remove-btn" onClick={() => handleRemove(s.id, MediaType.Image as MediaType)}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};