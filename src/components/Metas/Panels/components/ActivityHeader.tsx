import { ArrowBack } from '@mui/icons-material';

type ActivityHeaderProps = {
	name: string;
	closePanelsFunction: () => void;
	// hayCambios: boolean;
	// isFormOpen: boolean;
	// closePlanification: () => void;
	// cleanFormSelected: () => void;
	// handleModalShow: () => Promise<boolean>;
	// setIsFormOpen: (open: boolean) => void;
	// setIndexForm: (index: string) => void;
};

const ActivityHeader = ({
	name,
	closePanelsFunction,

}: ActivityHeaderProps) => {
	return (
		<div className='d-flex justify-content-between align-items-center mb-2 border-bottom'>
			<h4
				className='text-break m-2 border-3'
				style={{
					borderBottom: '2px solid #0a5d52',
					textOverflow: 'ellipsis',
					overflow: 'hidden',
					whiteSpace: 'nowrap',
				}}
			>
				{name}
			</h4>
			<ArrowBack
				fontSize='large'
				className='m-1 rounded'
				style={{ background: '#0a5d52', color: 'white' }}
				color='primary'
				onClick={closePanelsFunction}
			/>
		</div>
	);
};

export default ActivityHeader;
