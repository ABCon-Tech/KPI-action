import * as core from '@actions/core'
import * as github from '@actions/github'
import * as io from '@actions/io'
import {MdHeading} from './markdown'
import {MdDocumentBuilder} from './markdown/Builders'

async function run(): Promise<void> {
  try {
    const token = core.getInput('repo-token', {required: true})
    const outputDirectory = core.getInput('output-directory', {required: true})
    await io.mkdirP(outputDirectory)

    const octokit = github.getOctokit(token)
    const owner = github.context.repo.owner
    const repo = github.context.repo.repo
    const runDate = new Date()
    const lastRunDate = minusDays(runDate, 7)

    const {data} = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all'
    })

    let issueCount = 0,
      pullCount = 0,
      openIssues = 0,
      closedIssues = 0,
      openPulls = 0,
      closedPulls = 0,
      openIssuesWeek = 0,
      closedIssuesWeek = 0,
      openPullsWeek = 0,
      closedPullsWeek = 0
    const issues = []
    const pulls = []

    //Sorting and data processing
    for (const issue of data) {
      if (issue.hasOwnProperty('pull_request')) {
        pullCount++
        if (issue.state === 'open') {
          openPulls++
          new Date(issue.created_at) > lastRunDate && openPullsWeek++
        } else {
          closedPulls++
          issue.closed_at &&
            new Date(issue.closed_at) > lastRunDate &&
            closedPullsWeek++
        }
        pulls.push(issue)
      } else {
        issueCount++
        if (issue.state === 'open') {
          openIssues++
          new Date(issue.created_at) > lastRunDate && openIssuesWeek++
        } else {
          closedIssues++
          issue.closed_at &&
            new Date(issue.closed_at) > lastRunDate &&
            closedIssuesWeek++
        }
        issues.push(issue)
      }
    }

    core.info(`Total Number of Issues: ${issueCount.toString()}`)
    core.info(`Total Number of Pull Requests: ${pullCount.toString()}`)

    const summaryBuilder = new MdDocumentBuilder('Summary')
    summaryBuilder
      .heading(h => h.level(1).contentString('Progress Summary'))
      .paragraph(p =>
        p
          .text('Progress summary for IFC-Specification development upto: ')
          .text(runDate.toLocaleString())
      )
      .paragraph(p =>
        p.text('Total Number of Issues: ').text(issueCount.toString())
      )
      .paragraph(p =>
        p.text('Total Number of Pull Requests: ').text(pullCount.toString())
      )
      .heading(h => h.level(2).contentString('Summary Table'))
      .table(t =>
        t
          .columnString('Indicator')
          .columnString('Open')
          .columnString('Closed')
          .rows(r =>
            r
              .row([
                'Total Issues',
                openIssues.toString(),
                closedIssues.toString()
              ])
              .row([
                'Total Pull Requests',
                openPulls.toString(),
                closedPulls.toString()
              ])
              .row([
                'Issues This Week',
                openIssuesWeek.toString(),
                closedIssuesWeek.toString()
              ])
              .row([
                'Pull Requests This Week',
                openPullsWeek.toString(),
                closedPullsWeek.toString()
              ])
          )
      )

    const summary = summaryBuilder.build()
    core.info((summary.blocks[0] as MdHeading).content.content)
    summary.Save(outputDirectory)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

function minusDays(date: Date, days: number): Date {
  const ms = date.getMilliseconds() - days * 24 * 60 * 1000
  return new Date(ms)
}
