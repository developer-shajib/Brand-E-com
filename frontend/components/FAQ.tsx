import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const faqData = [
  {
    id: 1,
    question: 'Are these headphones waterproof?',
    answer: 'Our headphones have an IPX4 rating, which means they are splash and sweat resistant. They can handle light rain and workouts, but should not be submerged in water or worn during heavy rainfall.'
  },
  {
    id: 2,
    question: 'How long is the battery life?',
    answer: "Our headphones offer up to 40 hours of playback time on a single charge with ANC turned on. With ANC off, you can get up to 50 hours. A quick 10-minute charge provides up to 5 hours of listening time when you're in a hurry."
  },
  {
    id: 3,
    question: 'Can I connect to multiple devices at once?',
    answer:
      'Yes, our headphones support multipoint connection, allowing you to connect to two devices simultaneously. This means you can be connected to your laptop for a video call and still receive calls from your phone without having to disconnect and reconnect.'
  }
];

function FAQ({ sectionRef }: { sectionRef: React.RefObject<HTMLDivElement> }) {
  return (
    <section
      ref={sectionRef}
      className='py-16 bg-white dark:bg-slate-800'
      id='faq'>
      <div className='container mx-auto px-4'>
        <h2 className='text-2xl lg:text-3xl font-bold text-center mb-12'>Frequently Asked Questions</h2>

        <div className='max-w-3xl mx-auto'>
          <Accordion
            type='single'
            collapsible
            className='w-full'>
            {faqData.map((item) => (
              <AccordionItem
                key={item.id}
                value={`item-${item.id}`}
                className='transition-all duration-300 border-b dark:border-slate-300'>
                <AccordionTrigger className='text-base lg:text-md   cursor-pointer dark:border-slate-300'>{item.question}</AccordionTrigger>
                <AccordionContent className='text-base lg:text-base dark:text-slate-200'>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
