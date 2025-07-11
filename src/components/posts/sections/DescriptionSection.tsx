import MarkdownContent from '../MarkdownContent';

interface DescriptionSectionProps {
  description: string;
}

const DescriptionSection = ({ description }: DescriptionSectionProps) => {
  return (
    <section className='group'>
      <h2 className='flex items-center'>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
        {'개념'}
      </h2>
      {description ? (
        <MarkdownContent content={description} />
      ) : (
        <p className="text-sub">{'본문을 작성하세요.'}</p>
      )}
    </section>
  );
};

export default DescriptionSection;