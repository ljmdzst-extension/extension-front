import FormMembers from '../components/Forms/gestor/FormMembers';
import GeneralPanel from '../components/Panel/GeneralPanel';
import SideBarNav from '../components/Panel/component/SideBarNav';
import data from '../mock/formAExample.json';

const ProjectForm = () => {
	return <GeneralPanel SideBarPanel={<SideBarNav data={data} />} ContentPanel={<FormMembers />} />;
};

export default ProjectForm;
