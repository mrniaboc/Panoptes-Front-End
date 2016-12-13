import React from 'react';
import markdownz from 'markdownz';
import apiClient from 'panoptes-client/lib/api-client';
import talkClient from 'panoptes-client/lib/talk-client';
import FinishedBanner from './finished-banner.cjsx';
import TalkImages from './talk-images';
import ProjectMetadata from './metadata';
import ProjectHomeWorkflowButtons from './home-workflow-buttons';

const Markdown = markdownz.Markdown;

export default class ProjectHomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showWorkflowButtons: false,
      talkImages: [],
    };

    this.showWorkflowButtons = this.showWorkflowButtons.bind(this);
  }

  componentWillMount() {
    talkClient.type('comments').get({ section: `project-${this.props.project.id}`, page_size: 6, sort: '-created_at', focus_type: 'Subject' })
    .then((comments) => {
      const subjectIds = comments.map(x => x.focus_id);
      const uniqueImages = [...new Set(subjectIds)];
      uniqueImages.splice(3, 3);
      const talkImages = uniqueImages.map((id) => {
        return apiClient.type('subjects').get(id)
        .then((image) => {
          return image;
        });
      });
      Promise.all(talkImages).then((images) => {
        this.setState({ talkImages: images });
      });
    });
  }

  componentDidMount() {
    this.showWorkflowButtons();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context.user !== nextContext.user) {
      this.showWorkflowButtons(nextProps, nextContext);
    }
  }

  showWorkflowButtons(props = this.props, context = this.context) {
    const workflowAssignment = this.props.project.experimental_tools.includes('workflow assignment');

    if ((props.project.configuration && props.project.configuration.user_chooses_workflow && !workflowAssignment) ||
      (workflowAssignment && context.user)) {
      this.setState({ showWorkflowButtons: true });
    } else {
      this.setState({ showWorkflowButtons: false });
    }
  }

  renderResearcherWords() {
    // TODO: Show researcher avatar selected from lab and researcher words
    const avatarSrc = '/assets/simple-avatar.png';

    return (
      <div className="project-home-page__researcher-words">
        <img role="presentation" src={avatarSrc} />

        <div>
          <h4>Words from the researcher</h4>
          <span>&quot;{this.props.project.researcher_quote}&quot;</span>
        </div>
      </div>
    );
  }

  render() {
    const renderImages = this.state.talkImages.length > 2;

    return (
      <div className="project-home-page">
        <div id="projectLandingIntro" className="project-home-page__introduction call-to-action-container">
          <FinishedBanner project={this.props.project} />

          <div className="project-home-page__description">{this.props.project.description}</div>

          <ProjectHomeWorkflowButtons
            activeWorkflows={this.props.activeWorkflows}
            onChangePreferences={this.props.onChangePreferences}
            preferences={this.props.preferences}
            project={this.props.project}
            showWorkflowButtons={this.state.showWorkflowButtons}
            workflowAssignment={this.props.project.experimental_tools.includes('workflow assignment')}
            splits={this.props.splits}
          />

        </div>

        {renderImages && (
          <TalkImages images={this.state.talkImages} project={this.props.project} user={this.context.user} />
        )}

        <ProjectMetadata project={this.props.project} activeWorkflows={this.props.activeWorkflows} showTalkStatus={!renderImages} />

        <div className="project-home-page__container">

          {this.props.project.researcher_quote && (
            this.renderResearcherWords())}

          <div className="project-home-page__about-text">
            <h4>About {this.props.project.display_name}</h4>
            <Markdown project={this.props.project}>{this.props.project.introduction ? this.props.project.introduction : ''}</Markdown>
          </div>
        </div>

      </div>
    );
  }
}

ProjectHomePage.contextTypes = {
  geordi: React.PropTypes.object,
  user: React.PropTypes.object,
};

ProjectHomePage.defaultProps = {
  activeWorkflows: [],
  onChangePreferences: () => {},
  preferences: {},
  project: {},
  splits: {},
};

ProjectHomePage.propTypes = {
  activeWorkflows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  onChangePreferences: React.PropTypes.func.isRequired,
  preferences: React.PropTypes.object,
  project: React.PropTypes.shape({
    configuration: React.PropTypes.object,
    description: React.PropTypes.string,
    display_name: React.PropTypes.string,
    experimental_tools: React.PropTypes.arrayOf(React.PropTypes.string),
    id: React.PropTypes.string,
    introduction: React.PropTypes.string,
    researcher_quote: React.PropTypes.string,
  }).isRequired,
  splits: React.PropTypes.object,
};
