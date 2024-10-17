import React from 'react';

interface TitleProps {
	size?: 'small' | 'medium' | 'large' | string;
	color?: string;
	underline?: boolean;
	bold?: boolean;
	textAlign?: 'left' | 'center' | 'right';
	as?: keyof JSX.IntrinsicElements;
	truncate?: boolean;
	padding?: string;
	children: React.ReactNode;
}

const CommonTitle: React.FC<TitleProps> = ({
	size = 'medium',
	color = 'var(--bs-primary)',
	underline = false,
	bold = false,
	textAlign = 'left',
	as: Tag = 'h1',
	truncate = false,
	padding = '0',
	children,
}) => {
	const sizeClassMap = {
		small: 'fs-5',
		medium: 'fs-3',
		large: 'fs-1',
	};

	const sizeClass = sizeClassMap[size as keyof typeof sizeClassMap] || '';

	const styles = {
		color: color,
		textDecoration: underline ? 'underline' : 'none',
		fontWeight: bold ? 'bold' : 'normal',
		textAlign: textAlign as 'left' | 'center' | 'right',
		whiteSpace: truncate ? 'nowrap' : 'normal',
		overflow: truncate ? 'hidden' : 'visible',
		textOverflow: truncate ? 'ellipsis' : 'clip',
		padding: padding,
	};

	return (
		<Tag className={sizeClass} style={styles}>
			{children}
		</Tag>
	);
};

export default CommonTitle;
