import React, { Component } from 'react'
import { Title, Link }      from 'react-isomorphic-render'
import { connect }          from 'react-redux'

import styler from 'react-styling'

import { defineMessages } from 'react-intl'
import international      from '../../international/internationalize'

import Url                  from '../../../../code/url'
import { get_redirect_url } from '../../helpers/redirection'

const messages = defineMessages
({
	header:
	{
		id             : 'error_page.header',
		description    : 'Generic error page header',
		defaultMessage : 'An error occured'
	}
})

@international
export default class Generic_error extends Component
{
	render()
	{
		const { translate, location } = this.props

		const markup =
		(
			<section className="content error-page">
				<Title>{ translate(messages.header) }</Title>

				<h1>
					{ translate(messages.header) }
				</h1>

				<Link
					href={ get_redirect_url(location) }
					className="error-page__page-link">

					{ new Url(get_redirect_url(location)).to_relative_url() }
				</Link>
			</section>
		)

		return markup
	}
}

const style = styler
`
`