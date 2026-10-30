import React, { useState } from 'react';
import './ExpandableText.css';

const ExpandableText = ({ text, maxLength = 100 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) {
        return null;
    }

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const isExpandable = text.length > maxLength;
    const displayText = isExpanded ? text : `${text.slice(0, maxLength)}${isExpandable ? '...' : ''}`;

    return (
        <div className="expandable-text">
            <p>{displayText}</p>
            {isExpandable && (
                <button onClick={toggleExpand} className="expandable-text-button">
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                </button>
            )}
        </div>
    );
};

export default ExpandableText;
