import * as core from '@actions/core'
import * as github from '@actions/github'
import * as io from '@actions/io'
import {MdHeading, MdHeadingLevel} from './markdown'
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

    const iterator = octokit.paginate.iterator(
      octokit.rest.issues.listForRepo,
      {
        owner,
        repo,
        state: 'all',
        per_page: 100
      }
    )

    let issueCount = 0,
      pullCount = 0
    const openIssues = []
    const openPulls = []
    const closedIssues = []
    const closedPulls = []
    const openPullsExpress: any[] = []
    const openIssuesExpress: any[] = []
    const closedPullsExpress: any[] = []
    const closedIssuesExpress: any[] = []
    const openPullsDoc: any[] = []
    const openIssuesDoc: any[] = []
    const closedPullsDoc: any[] = []
    const closedIssuesDoc: any[] = []

    //Sorting and data processing
    for await (const {data} of iterator) {
      for (const issue of data) {
        if (issue.hasOwnProperty('pull_request')) {
          pullCount++
          if (issue.state === 'open') {
            openPulls.push(issue)
            catagoriseByLabel(issue, 'EXPRESS', openPullsExpress)
            catagoriseByLabel(issue, 'documentation', openPullsExpress)
          } else {
            closedPulls.push(issue)
            catagoriseByLabel(issue, 'EXPRESS', closedPullsExpress)
            catagoriseByLabel(issue, 'documentation', closedPullsExpress)
          }
        } else {
          issueCount++
          if (issue.state === 'open') {
            openIssues.push(issue)
            catagoriseByLabel(issue, 'EXPRESS', openIssuesExpress)
            catagoriseByLabel(issue, 'documentation', openIssuesExpress)
          } else {
            closedIssues.push(issue)
            catagoriseByLabel(issue, 'EXPRESS', closedIssuesExpress)
            catagoriseByLabel(issue, 'documentation', closedIssuesExpress)
          }
        }
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
          .columnString('Opened')
          .columnString('Closed')
          .columnString('Total')
          .rows(r =>
            r
              .row([
                'Issues',
                openIssues.length.toString(),
                closedIssues.length.toString(),
                issueCount.toString()
              ])
              .row([
                'Pull Requests',
                openPulls.length.toString(),
                closedPulls.length.toString(),
                pullCount.toString()
              ])
          )
      )
    ListingBlock(
      summaryBuilder,
      'Issues/Pull Requests effecting EXPRESS Schema',
      2,
      openIssuesExpress,
      openPullsExpress,
      closedIssuesExpress,
      closedPullsExpress,
      true,
      'Current issues effecting the content of the EXPRESS schema for IFC4x3.'
    )

    ListingBlock(
      summaryBuilder,
      'Issues/Pull Requests effecting Documentation',
      2,
      openIssuesDoc,
      openPullsDoc,
      closedIssuesDoc,
      closedPullsDoc,
      true,
      'Current issues effecting the content of the Documentation for IFC4x3.'
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

function catagoriseByLabel(
  issue: {labels: any[]},
  label: any,
  collector: any[]
) {
  if (issue.labels.some(l => l.name === label)) {
    collector.push(issue)
  }
}
function ListingBlock(
  summaryBuilder: MdDocumentBuilder,
  heading: string,
  level: MdHeadingLevel,
  openIssues: any[],
  openPulls: any[],
  closedIssues: any[],
  closedPulls: any[],
  listOpen: boolean,
  introduction?: string
) {
  summaryBuilder.heading(h => h.level(level).contentString(heading))
  if (introduction) summaryBuilder.paragraph(p => p.text(introduction))
  summaryBuilder.table(t =>
    t
      .columnString('Indicator')
      .columnString('Opened')
      .columnString('Closed')
      .columnString('Total')
      .rows(r =>
        r
          .row([
            'Issues',
            openIssues.length.toString(),
            closedIssues.length.toString(),
            (openIssues.length + closedIssues.length).toString()
          ])
          .row([
            'Pull Requests',
            openPulls.length.toString(),
            closedPulls.length.toString(),
            (openPulls.length + closedPulls.length).toString()
          ])
      )
  )

  if (listOpen) {
    summaryBuilder.heading(h =>
      h
        .level(level + 1 > 6 ? level : ((level + 1) as MdHeadingLevel))
        .contentString('Open Issues')
    )
    summaryBuilder.paragraph(p => {
      for (const issue of openIssues) {
        p.text(`> #${issue.number} - ${issue.title}`)
      }
    })

    summaryBuilder.heading(h =>
      h
        .level(level + 1 > 6 ? level : ((level + 1) as MdHeadingLevel))
        .contentString('Open Pull Requests')
    )
    summaryBuilder.paragraph(p => {
      for (const issue of openPulls) {
        p.text(`> #${issue.number} - ${issue.title}`)
      }
    })
  }
}
