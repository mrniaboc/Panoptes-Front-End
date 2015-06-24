React = require 'react'
{Link} = require 'react-router'
{timestamp, timeAgo} = require './lib/time'
resourceCount = require './lib/resource-count'
talkClient = require '../api/talk'
ChangeListener = require '../components/change-listener'
PromiseRenderer = require '../components/promise-renderer'
apiClient = require '../api/client'
merge = require 'lodash.merge'
Avatar = require '../partials/avatar'

module?.exports = React.createClass
  displayName: 'TalkBoardDisplay'

  propTypes:
    data: React.PropTypes.object

  projectPrefix: ->
    if @props.project then 'project-' else ''

  render: ->
    <div className="talk-board-preview">
      <h1>
        <Link to="#{@projectPrefix()}talk-board" params={merge({}, {board: @props.data.id}, @props.params)}>
           {@props.data.title}
        </Link>
      </h1>

      <p>{@props.data.description}</p>

      <PromiseRenderer promise={talkClient.type('discussions').get({board_id: @props.data.id}).index(0)}>{(discussion) =>
        if discussion?
          <div className="talk-discussion-link">
            <PromiseRenderer promise={apiClient.type('users').get(discussion.user_id.toString())}>{(user) =>
              <Link className="user-profile-link" to="user-profile" params={name: discussion.user_login}>
                <Avatar user={user} />{' '}{discussion.user_display_name}
              </Link>
            }</PromiseRenderer>{' '}

            <Link to="talk-discussion" params={board: discussion.board_id, discussion: discussion.id}>{discussion.title}</Link>{' '}
            <span>{timeAgo(discussion.updated_at)}</span>
          </div>
      }</PromiseRenderer>

      <p>
        <i className="fa fa-user"></i> {resourceCount(@props.data.users_count, "Users")} |&nbsp;
        <i className="fa fa-newspaper-o"></i> {resourceCount(@props.data.discussions_count, "Discussions") } |&nbsp;
        <i className="fa fa-comment"></i> {resourceCount(@props.data.comments_count, "Comments")}</p>
      <p>Last Updated: {timestamp(@props.data.updated_at)}</p>
      
    </div>
