import React, { useState } from 'react';
import {Proposal, ProposalType} from "@dataverse/snapshot-client-toolkit";
interface FormValues {
  space: string;
  type: string;
  title: string;
  body: string;
  choices: string[];
  discussion: string;
  start: Date;
  end: Date;
  snapshot: number;
  plugins: string;
  app: string;
}

interface ProposalFormProp {
  onSubmit: (proposal: Proposal) => void;
}


const ProposalForm: React.FC<ProposalFormProp> = ({onSubmit}) => {
  const [formValues, setFormValues] = useState<FormValues>({
    space: 'toolkits.eth',
    type: 'single-choice',
    title: 'proposal title',
    body: 'proposal description',
    choices: ['option01', 'option02', 'option03'],
    discussion: 'external link for more detail',
    start: new Date(),
    end: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)), // ONE_DAY in milliseconds
    snapshot: 17561820,
    plugins: JSON.stringify({}),
    app: 'your app name'
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const timeSecond = (dateStr: string) :number => {
      console.log("date: ", dateStr);
      return Number((new Date(dateStr).getTime()/ 1000).toFixed(0))
    }
    const proposal:Proposal = {
      space: formValues.space,
      type: formValues.type as ProposalType,
      title: formValues.title,
      body: formValues.body,
      choices: formValues.choices,
      discussion: formValues.discussion,
      start: timeSecond(formValues.start.toString()),
      end: timeSecond(formValues.end.toString()) + (24 * 60 * 60), // ONE_DAY in milliseconds
      snapshot: 17561820,
      plugins: JSON.stringify({}),
      app: 'my-app-01'
    }

    onSubmit(proposal);
    // Handle form submission here
    console.log(formValues);
  };
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Space:
        <input type="text" name="space" value={formValues.space} onChange={handleChange} />
      </label>
      <br/>
      <label>
        Type:
        <input type="text" name="type" value={formValues.type} onChange={handleChange} />
      </label>
      <br/>
      <label>
        Title:
        <input type="text" name="title" value={formValues.title} onChange={handleChange} />
      </label>
      <br/>
      <label>
        Body:
        <input type="text" name="body" value={formValues.body} onChange={handleChange} />
      </label>
      <br/>
      <label>
        Choices:
        <input type="text" name="choices" value={formValues.choices.join(',')} onChange={handleChange} />
      </label>
      <br/>
      <label>
        Discussion:
        <input type="text" name="discussion" value={formValues.discussion} onChange={handleChange} />
      </label>
      <br/>
      <label>
        Start:
        <input type="datetime-local" name="start" value={formValues.start.toString()} onChange={handleChange} />
      </label>
      <br/>
      <label>
        End:
        <input type="datetime-local" name="end" value={formValues.end.toString()} onChange={handleChange} />
      </label>
      <br/>
      <label>
        Snapshot:
        <input type="number" name="snapshot" value={formValues.snapshot.toString()} onChange={handleChange} />
      </label>
      <br/>
      <label>
        Plugins:
        <input type="text" name="plugins" value={formValues.plugins} onChange={handleChange} />
      </label>
      <br/>
      <label>
        App:
        <input type="text" name="app" value={formValues.app} onChange={handleChange} />
      </label>
      <br/>
      <button type="submit">createProposal</button>
    </form>
  );
};
export default ProposalForm;