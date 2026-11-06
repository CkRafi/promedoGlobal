import React from 'react';

const Stats = () => {
  const stats = [
    { label: 'Prometric Success Rate', value: '98%+' },
    { label: 'Years of Coaching Excellence', value: '5+' },
    { label: 'Practice Questions & Mock Items', value: '10,000+' },
    { label: 'Doctors Trained', value: '750+' },
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-gray rounded-[40px] py-16 px-8 flex flex-wrap justify-around items-center gap-12">
          {stats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              <div className="text-center">
                <div className="text-6xl font-display font-bold mb-2">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
              {index < stats.length - 1 && (
                <div className="hidden lg:block w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
