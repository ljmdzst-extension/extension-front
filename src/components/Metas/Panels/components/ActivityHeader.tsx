import CommonIconWithTooltip from '@/components/Common/Icon/CommonIconWithTooltip';
import CommonTitle from '@/components/Common/Text/CommonTitle';
import { ArrowBack } from '@mui/icons-material';

type ActivityHeaderProps = {
	name: string;
	closePanelsFunction: () => void;
};

const ActivityHeader = ({ name, closePanelsFunction }: ActivityHeaderProps) => {
	return (
		<div className='d-flex justify-content-between align-items-center border-bottom p-1'>
			<div className='d-flex align-items-center flex-grow-1 overflow-hidden'>
				<CommonTitle
					size='small'
					color='var(--bs-secondary)'
					truncate
					underline
					bold
				>
					{name}
				</CommonTitle>
			</div>

			<div className='d-flex align-items-center ms-2'>
				<CommonIconWithTooltip
					tooltipText='Atras'
					Icon={ArrowBack}
					onClick={closePanelsFunction}
					style={{
						background: '#0a5d52',
						color: 'white',
						borderRadius: '.3rem',
						fontSize: '30px',
					}}
				/>
			</div>
		</div>
	);
};

export default ActivityHeader;
