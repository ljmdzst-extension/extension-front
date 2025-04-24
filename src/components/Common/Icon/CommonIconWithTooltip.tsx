import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface Props {
	tooltipText: string;
	Icon: React.ElementType;
	style?: React.CSSProperties;
	onClick?: () => void; 
	forcePointer?: boolean; 
}

const CommonIconWithTooltip: React.FC<Props> = ({ tooltipText, Icon, style, onClick, forcePointer = false }) => {
	const renderTooltip = (props: any) => (
		<Tooltip id='button-tooltip' {...props}>
			{tooltipText}
		</Tooltip>
	);

	return (
		<OverlayTrigger placement='top' overlay={renderTooltip}>
			<span
				style={{
					cursor: onClick || forcePointer ? 'pointer' : 'default',
				}}
				onClick={onClick}
			>
				<Icon style={style} />
			</span>
		</OverlayTrigger>
	);
};

export default CommonIconWithTooltip;
