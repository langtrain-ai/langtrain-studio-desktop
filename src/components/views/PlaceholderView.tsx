/**
 * Placeholder View Component
 * Used for views that are not yet implemented
 */

import { Construction } from 'lucide-react';
import './PlaceholderView.css';

interface PlaceholderViewProps {
    title: string;
    description?: string;
}

export function PlaceholderView({ title, description }: PlaceholderViewProps) {
    return (
        <div className="placeholder-view">
            <div className="placeholder-view__content">
                <Construction size={48} className="placeholder-view__icon" />
                <h2 className="placeholder-view__title">{title}</h2>
                <p className="placeholder-view__description">
                    {description || 'This view is under construction. Check back soon!'}
                </p>
            </div>
        </div>
    );
}
